import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getConfig } from './config.js';

/**
 * Computes a git blob SHA-1 hash for a buffer or string
 */
export function computeGitSha(contentBuffer) {
  const buf = Buffer.isBuffer(contentBuffer) ? contentBuffer : Buffer.from(contentBuffer, 'utf8');
  const header = `blob ${buf.length}\0`;
  const store = Buffer.concat([Buffer.from(header, 'utf8'), buf]);
  return crypto.createHash('sha1').update(store).digest('hex');
}

/**
 * Reads a content file from GitHub Contents API (or local filesystem in dev fallback)
 */
export async function getGitHubFile(filePath) {
  const config = getConfig();

  // If token is configured, fetch directly from GitHub Contents API
  if (config.GITHUB_CONTENT_TOKEN) {
    const url = `https://api.github.com/repos/${config.GITHUB_OWNER}/${config.GITHUB_REPO}/contents/${filePath}?ref=${config.GITHUB_BRANCH}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.GITHUB_CONTENT_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Portfolio-CMS',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (res.status === 404) {
      return { found: false, content: null, sha: null };
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(`GitHub API error (${res.status}): ${errBody.message || res.statusText}`);
    }

    const data = await res.json();
    const rawContent = Buffer.from(data.content, 'base64').toString('utf8');
    return {
      found: true,
      content: rawContent,
      sha: data.sha,
      path: data.path,
    };
  }

  // Development fallback: Read from local filesystem
  const localPath = path.resolve(process.cwd(), filePath);
  if (fs.existsSync(localPath)) {
    const rawContent = fs.readFileSync(localPath, 'utf8');
    const sha = computeGitSha(rawContent);
    return {
      found: true,
      content: rawContent,
      sha,
      path: filePath,
      isLocalFallback: true,
    };
  }

  return { found: false, content: null, sha: null };
}

/**
 * Updates or creates a content file via GitHub Contents API
 */
export async function putGitHubFile({ filePath, content, sha, message, authorName, authorEmail }) {
  const config = getConfig();
  const commitMsg = message || `cms: update ${filePath} via admin dashboard`;

  // If token is configured, commit via GitHub API
  if (config.GITHUB_CONTENT_TOKEN) {
    const url = `https://api.github.com/repos/${config.GITHUB_OWNER}/${config.GITHUB_REPO}/contents/${filePath}`;
    const base64Content = Buffer.from(content, 'utf8').toString('base64');

    const body = {
      message: commitMsg,
      content: base64Content,
      branch: config.GITHUB_BRANCH,
    };

    if (sha) {
      body.sha = sha;
    }

    if (authorName) {
      body.committer = {
        name: authorName,
        email: authorEmail || 'cms@portfolio.local',
      };
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.GITHUB_CONTENT_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Portfolio-CMS',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify(body),
    });

    if (res.status === 409) {
      throw new Error('Conflict: The file has been modified on GitHub since you loaded it. Please reload and review changes before saving.');
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(`GitHub API commit failed (${res.status}): ${errBody.message || res.statusText}`);
    }

    const data = await res.json();
    return {
      success: true,
      sha: data.content?.sha || null,
      commit: data.commit?.sha || null,
      message: commitMsg,
    };
  }

  // Development fallback: Write to local filesystem
  const localPath = path.resolve(process.cwd(), filePath);
  const dir = path.dirname(localPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Check SHA conflict against local file if SHA was provided
  if (fs.existsSync(localPath) && sha) {
    const currentRaw = fs.readFileSync(localPath, 'utf8');
    const currentSha = computeGitSha(currentRaw);
    if (currentSha !== sha) {
      throw new Error('Conflict: The local file was modified since you loaded it. Please reload to resolve.');
    }
  }

  fs.writeFileSync(localPath, content, 'utf8');
  const newSha = computeGitSha(content);

  return {
    success: true,
    sha: newSha,
    commit: 'local-dev-commit',
    message: commitMsg,
    isLocalFallback: true,
  };
}

/**
 * Uploads an image file to public/images/projects/ via GitHub Contents API
 */
export async function uploadImageFile({ filename, buffer, mimeType, authorName }) {
  const config = getConfig();

  // Validate filename
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
  const ext = path.extname(sanitized);

  if (!allowedExts.includes(ext)) {
    throw new Error(`Unsupported image extension "${ext}". Allowed: ${allowedExts.join(', ')}`);
  }

  const relativePath = `public/images/projects/${sanitized}`;
  const commitMsg = `cms: upload asset ${sanitized}`;

  if (config.GITHUB_CONTENT_TOKEN) {
    const url = `https://api.github.com/repos/${config.GITHUB_OWNER}/${config.GITHUB_REPO}/contents/${relativePath}`;
    const base64Content = buffer.toString('base64');

    // Check if file already exists to get its SHA
    let existingSha = undefined;
    const checkRes = await fetch(url + `?ref=${config.GITHUB_BRANCH}`, {
      headers: {
        Authorization: `Bearer ${config.GITHUB_CONTENT_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Portfolio-CMS',
      },
    });
    if (checkRes.ok) {
      const existingData = await checkRes.json();
      existingSha = existingData.sha;
    }

    const body = {
      message: commitMsg,
      content: base64Content,
      branch: config.GITHUB_BRANCH,
    };
    if (existingSha) body.sha = existingSha;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.GITHUB_CONTENT_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Portfolio-CMS',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(`Image upload failed (${res.status}): ${errBody.message || res.statusText}`);
    }

    const data = await res.json();
    return {
      success: true,
      url: `/images/projects/${sanitized}`,
      sha: data.content?.sha,
    };
  }

  // Development fallback: write to public/images/projects/
  const targetDir = path.resolve(process.cwd(), 'public/images/projects');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const destPath = path.join(targetDir, sanitized);
  fs.writeFileSync(destPath, buffer);

  return {
    success: true,
    url: `/images/projects/${sanitized}`,
    sha: computeGitSha(buffer),
    isLocalFallback: true,
  };
}
