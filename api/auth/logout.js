import { getConfig } from '../_lib/config.js';
import { clearSessionCookie, validateOrigin } from '../_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin or CSRF rejected' });
  }

  const config = getConfig();
  const cookiesToClear = clearSessionCookie(config.isProduction);

  res.setHeader('Set-Cookie', cookiesToClear);
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}
