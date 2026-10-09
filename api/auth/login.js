import { getConfig } from '../_lib/config.js';
import { createOAuthState } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const config = getConfig();

  if (!config.GITHUB_CLIENT_ID) {
    return res.status(500).json({
      error: 'GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
    });
  }

  const { state, cookie } = createOAuthState(config.isProduction);
  const callbackUrl = `${config.APP_URL}/api/auth/callback`;

  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', config.GITHUB_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', callbackUrl);
  authUrl.searchParams.set('scope', 'read:user');
  authUrl.searchParams.set('state', state);

  res.setHeader('Set-Cookie', cookie);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.writeHead(302, { Location: authUrl.toString() });
  return res.end();
}
