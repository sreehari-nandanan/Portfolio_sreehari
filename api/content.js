import { getSession, validateOrigin } from './_lib/auth.js';
import { normalizeAndValidateContentPath, validateContentSchema } from './_lib/allowlist.js';
import { getGitHubFile, putGitHubFile } from './_lib/github.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  // 1. Authenticate request
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Admin session required' });
  }

  // 2. Route by HTTP method
  if (req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost');
    const fileParam = url.searchParams.get('file');

    if (!fileParam) {
      return res.status(400).json({ error: 'Missing required "file" query parameter' });
    }

    const approvedPath = normalizeAndValidateContentPath(fileParam);
    if (!approvedPath) {
      return res.status(403).json({ error: 'Forbidden: Access to this file path is not allowed' });
    }

    try {
      const fileData = await getGitHubFile(approvedPath);
      if (!fileData.found) {
        return res.status(404).json({ error: `File "${approvedPath}" not found` });
      }

      let parsed = null;
      try {
        parsed = JSON.parse(fileData.content);
      } catch {
        parsed = fileData.content;
      }

      return res.status(200).json({
        file: approvedPath,
        content: parsed,
        sha: fileData.sha,
        isLocalFallback: !!fileData.isLocalFallback,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Failed to read content file' });
    }
  }

  if (req.method === 'PUT') {
    // Validate CSRF / origin
    if (!validateOrigin(req)) {
      return res.status(403).json({ error: 'Invalid origin header' });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON request body' });
      }
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    const { file, content, sha, message } = body;

    if (!file) {
      return res.status(400).json({ error: 'Missing "file" field in payload' });
    }

    const approvedPath = normalizeAndValidateContentPath(file);
    if (!approvedPath) {
      return res.status(403).json({ error: 'Forbidden: File path is not allowlisted' });
    }

    // Schema validation
    const validation = validateContentSchema(approvedPath, content);
    if (!validation.valid) {
      return res.status(400).json({ error: `Validation failed: ${validation.error}` });
    }

    // Format content cleanly with 2 spaces
    const formattedContent = JSON.stringify(validation.parsed, null, 2) + '\n';

    try {
      const result = await putGitHubFile({
        filePath: approvedPath,
        content: formattedContent,
        sha,
        message: message || `cms: update ${approvedPath} by @${session.user.login}`,
        authorName: session.user.login,
      });

      return res.status(200).json({
        success: true,
        file: approvedPath,
        sha: result.sha,
        commit: result.commit,
        message: result.message,
        isLocalFallback: result.isLocalFallback,
      });
    } catch (err) {
      const isConflict = err.message && err.message.includes('Conflict');
      return res.status(isConflict ? 409 : 500).json({
        error: err.message || 'Failed to save content to GitHub',
        conflict: isConflict,
      });
    }
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Method not allowed' });
}
