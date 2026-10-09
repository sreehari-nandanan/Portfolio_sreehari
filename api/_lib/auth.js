import crypto from 'node:crypto';
import { getConfig } from './config.js';

const SESSION_COOKIE_NAME = '__Host-portfolio_session';
const FALLBACK_COOKIE_NAME = 'portfolio_session';
const STATE_COOKIE_NAME = 'portfolio_oauth_state';
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Derive a 32-byte AES key from SESSION_SECRET
function getEncryptionKey(secret) {
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a JSON payload into an AES-256-GCM sealed string
 */
export function sealSession(payload, secret) {
  const key = getEncryptionKey(secret);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  const text = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}.${tag.toString('hex')}.${encrypted.toString('hex')}`;
}

/**
 * Decrypt and verify an AES-256-GCM sealed string
 */
export function unsealSession(sealedString, secret) {
  if (!sealedString || typeof sealedString !== 'string') return null;
  const parts = sealedString.split('.');
  if (parts.length !== 3) return null;

  try {
    const key = getEncryptionKey(secret);
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    const payload = JSON.parse(decrypted.toString('utf8'));

    if (payload.expiresAt && payload.expiresAt < Date.now()) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Parses cookies from incoming HTTP request headers
 */
export function parseCookies(req) {
  const header = req.headers?.cookie || req.headers?.Cookie || '';
  const cookies = {};
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx !== -1) {
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      cookies[key] = decodeURIComponent(val);
    }
  });
  return cookies;
}

/**
 * Formats a Set-Cookie string with optimal security attributes
 */
export function createCookie(name, value, maxAgeSeconds, isProduction) {
  const isSecure = isProduction;
  let cookie = `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
  if (isSecure) {
    cookie += '; Secure';
  }
  return cookie;
}

/**
 * Gets session cookie name (prefers __Host- prefix in production over HTTPS)
 */
export function getSessionCookieName(isProduction) {
  return isProduction ? SESSION_COOKIE_NAME : FALLBACK_COOKIE_NAME;
}

/**
 * Retrieves and validates the current admin session from the request
 */
export function getSession(req) {
  const config = getConfig();
  const cookies = parseCookies(req);
  const sealed = cookies[SESSION_COOKIE_NAME] || cookies[FALLBACK_COOKIE_NAME];
  if (!sealed) return null;

  const session = unsealSession(sealed, config.SESSION_SECRET);
  if (!session || !session.user || !session.user.login) return null;

  // Strict allowlist validation
  if (session.user.login.toLowerCase() !== config.ADMIN_GITHUB_USERNAME.toLowerCase()) {
    return null;
  }
  return session;
}

/**
 * Generates cryptographically secure OAuth state and temporary cookie
 */
export function createOAuthState(isProduction) {
  const state = crypto.randomBytes(32).toString('hex');
  const cookie = createCookie(STATE_COOKIE_NAME, state, 600, isProduction); // 10 minutes
  return { state, cookie };
}

/**
 * Validates OAuth state from request against expected value
 */
export function validateOAuthState(req, expectedState) {
  if (!expectedState) return false;
  const cookies = parseCookies(req);
  const stateCookie = cookies[STATE_COOKIE_NAME];
  return stateCookie && stateCookie === expectedState;
}

/**
 * Clears the temporary OAuth state cookie
 */
export function clearOAuthStateCookie(isProduction) {
  return createCookie(STATE_COOKIE_NAME, '', 0, isProduction);
}

/**
 * Clears the session cookie (logout)
 */
export function clearSessionCookie(isProduction) {
  const primary = createCookie(SESSION_COOKIE_NAME, '', 0, isProduction);
  const fallback = createCookie(FALLBACK_COOKIE_NAME, '', 0, isProduction);
  return [primary, fallback];
}

/**
 * CSRF origin validation for state-changing requests
 */
export function validateOrigin(req) {
  const config = getConfig();
  // Safe methods do not require origin check
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;

  const origin = req.headers?.origin || req.headers?.Origin;
  const referer = req.headers?.referer || req.headers?.Referer;
  const host = req.headers?.host || req.headers?.Host;

  if (!origin && !referer) {
    // If neither is present, permit only in local dev testing if host matches
    return !config.isProduction;
  }

  const checkUrl = origin || referer;
  try {
    const parsed = new URL(checkUrl);
    // Allow matching host or matching configured APP_URL origin
    if (host && (parsed.host === host || parsed.origin === config.APP_URL)) {
      return true;
    }
    // Allow localhost/127.0.0.1 in non-production
    if (!config.isProduction && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
