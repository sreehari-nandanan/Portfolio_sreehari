import { getConfig } from '../_lib/config.js';
import {
  validateOAuthState,
  clearOAuthStateCookie,
  sealSession,
  createCookie,
  getSessionCookieName,
} from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const config = getConfig();
  const url = new URL(req.url, config.APP_URL);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  const cookiesToSet = [clearOAuthStateCookie(config.isProduction)];

  if (error) {
    res.setHeader('Set-Cookie', cookiesToSet);
    res.writeHead(302, { Location: `/signin?error=${encodeURIComponent(error)}` });
    return res.end();
  }

  if (!code || !state) {
    res.setHeader('Set-Cookie', cookiesToSet);
    res.writeHead(302, { Location: '/signin?error=missing_oauth_parameters' });
    return res.end();
  }

  const isValidState = validateOAuthState(req, state);
  if (!isValidState) {
    res.setHeader('Set-Cookie', cookiesToSet);
    res.writeHead(302, { Location: '/signin?error=invalid_oauth_state' });
    return res.end();
  }

  try {
    // 1. Exchange authorization code for GitHub access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: config.GITHUB_CLIENT_ID,
        client_secret: config.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${config.APP_URL}/api/auth/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
      res.setHeader('Set-Cookie', cookiesToSet);
      res.writeHead(302, { Location: '/signin?error=token_exchange_failed' });
      return res.end();
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated GitHub user details
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Portfolio-CMS',
      },
    });

    if (!userResponse.ok) {
      res.setHeader('Set-Cookie', cookiesToSet);
      res.writeHead(302, { Location: '/signin?error=failed_fetching_user' });
      return res.end();
    }

    const userData = await userResponse.json();

    // 3. Strict Administrator Verification
    const githubUsername = (userData.login || '').toLowerCase();
    const authorizedAdmin = config.ADMIN_GITHUB_USERNAME.toLowerCase();

    if (githubUsername !== authorizedAdmin) {
      // Forbidden: Not the authorized administrator
      res.setHeader('Set-Cookie', cookiesToSet);
      res.writeHead(302, {
        Location: `/signin?error=unauthorized_account&user=${encodeURIComponent(userData.login)}`,
      });
      return res.end();
    }

    // 4. Create encrypted HTTP-only session cookie
    const sessionPayload = {
      user: {
        id: userData.id,
        login: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
      },
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    const sealedSession = sealSession(sessionPayload, config.SESSION_SECRET);
    const sessionCookieName = getSessionCookieName(config.isProduction);
    const sessionCookie = createCookie(
      sessionCookieName,
      sealedSession,
      7 * 24 * 60 * 60,
      config.isProduction
    );

    cookiesToSet.push(sessionCookie);

    res.setHeader('Set-Cookie', cookiesToSet);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.writeHead(302, { Location: '/admin' });
    return res.end();
  } catch (err) {
    res.setHeader('Set-Cookie', cookiesToSet);
    res.writeHead(302, { Location: '/signin?error=internal_auth_error' });
    return res.end();
  }
}
