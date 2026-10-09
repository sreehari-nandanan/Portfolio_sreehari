import { getSession, validateOrigin } from './_lib/auth.js';
import { uploadImageFile } from './_lib/github.js';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Admin authentication check
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Admin session required' });
  }

  // Origin / CSRF check
  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin header' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON request payload' });
    }
  }

  const { filename, data, mimeType } = body || {};

  if (!filename || !data) {
    return res.status(400).json({ error: 'Missing filename or image data' });
  }

  // Strip data URL prefix if present (e.g. "data:image/png;base64,...")
  let cleanBase64 = data;
  if (cleanBase64.includes('base64,')) {
    cleanBase64 = cleanBase64.split('base64,')[1];
  }

  const buffer = Buffer.from(cleanBase64, 'base64');
  if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
    return res.status(400).json({
      error: `Image exceeds maximum allowed size of 5 MB (size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB)`,
    });
  }

  try {
    const result = await uploadImageFile({
      filename,
      buffer,
      mimeType: mimeType || 'image/png',
      authorName: session.user.login,
    });

    return res.status(200).json({
      success: true,
      url: result.url,
      sha: result.sha,
      isLocalFallback: result.isLocalFallback,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Image upload failed' });
  }
}
