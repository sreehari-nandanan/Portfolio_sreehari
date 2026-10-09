import { getSession } from '../_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getSession(req);

  if (!session) {
    return res.status(401).json({
      authenticated: false,
      message: 'Unauthorized',
      user: null,
    });
  }

  return res.status(200).json({
    authenticated: true,
    user: session.user,
  });
}
