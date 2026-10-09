import fs from 'node:fs';
import path from 'node:path';

// Helper to load .env variables in local Node/Vite environments if not already injected
function loadEnvFile() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val.replace(/^["']|["']$/g, '');
          }
        }
      });
    }
  } catch (err) {
    console.warn('Could not read .env file:', err.message);
  }
}

loadEnvFile();

export function getConfig() {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
  const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
  const GITHUB_CONTENT_TOKEN = process.env.GITHUB_CONTENT_TOKEN || '';
  const GITHUB_OWNER = process.env.GITHUB_OWNER || 'sreehari-nandanan';
  const GITHUB_REPO = process.env.GITHUB_REPO || 'Portfolio_sreehari';
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
  const ADMIN_GITHUB_USERNAME = (process.env.ADMIN_GITHUB_USERNAME || 'sreehari-nandanan').toLowerCase();
  const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_fallback_secret_must_be_32_chars_long!';
  const rawAppUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173');
  const APP_URL = rawAppUrl.replace(/\/+$/, '');

  return {
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_CONTENT_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO,
    GITHUB_BRANCH,
    ADMIN_GITHUB_USERNAME,
    SESSION_SECRET,
    APP_URL,
    isProduction: process.env.NODE_ENV === 'production' || !!process.env.VERCEL,
  };
}
