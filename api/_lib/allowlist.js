import path from 'node:path';

// Whitelist of content files permitted to be read and modified
export const APPROVED_CONTENT_FILES = Object.freeze([
  'public/content/profile.json',
  'public/content/projects.json',
  'public/content/skills.json',
  'public/content/experience.json',
  'public/content/achievements.json',
  'public/content/education.json',
  'public/content/certifications.json',
  'public/content/site-settings.json',
]);

/**
 * Normalizes and verifies whether a given relative file path is strictly approved
 */
export function normalizeAndValidateContentPath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') return null;

  // Prevent directory traversal and malicious characters
  if (inputPath.includes('..') || inputPath.includes('\0') || inputPath.includes('\\')) {
    return null;
  }

  // Strip leading slash
  let cleanPath = inputPath.startsWith('/') ? inputPath.slice(1) : inputPath;

  // Allow shorthand like "projects.json" -> "public/content/projects.json"
  if (!cleanPath.startsWith('public/content/')) {
    cleanPath = `public/content/${cleanPath}`;
  }

  // Match against exact allowlist
  if (APPROVED_CONTENT_FILES.includes(cleanPath)) {
    return cleanPath;
  }

  return null;
}

/**
 * Validates the structure and syntax of content before writing
 */
export function validateContentSchema(filePath, data) {
  if (!data) return { valid: false, error: 'Content cannot be empty' };

  let parsed = data;
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch (err) {
      return { valid: false, error: `Invalid JSON syntax: ${err.message}` };
    }
  }

  const base = path.basename(filePath);

  switch (base) {
    case 'projects.json': {
      if (!Array.isArray(parsed)) {
        return { valid: false, error: 'projects.json must contain an array of projects' };
      }
      for (let i = 0; i < parsed.length; i++) {
        const p = parsed[i];
        if (!p.id || typeof p.id !== 'string') {
          return { valid: false, error: `Project at index ${i} is missing a string 'id'` };
        }
        if (!p.title || typeof p.title !== 'string') {
          return { valid: false, error: `Project at index ${i} is missing a string 'title'` };
        }
      }
      break;
    }
    case 'profile.json': {
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return { valid: false, error: 'profile.json must contain an object' };
      }
      if (!parsed.name && !parsed.firstName) {
        return { valid: false, error: 'profile.json must contain at least a name' };
      }
      break;
    }
    case 'experience.json': {
      if (!Array.isArray(parsed)) {
        return { valid: false, error: 'experience.json must contain an array' };
      }
      break;
    }
    case 'achievements.json': {
      if (!Array.isArray(parsed)) {
        return { valid: false, error: 'achievements.json must contain an array' };
      }
      break;
    }
    case 'skills.json': {
      if (typeof parsed !== 'object' || parsed === null) {
        return { valid: false, error: 'skills.json must contain an object or array' };
      }
      break;
    }
    case 'education.json':
    case 'certifications.json': {
      if (!Array.isArray(parsed)) {
        return { valid: false, error: `${base} must contain an array` };
      }
      break;
    }
    case 'site-settings.json': {
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return { valid: false, error: 'site-settings.json must contain an object' };
      }
      break;
    }
    default:
      return { valid: false, error: `Unrecognized content file: ${base}` };
  }

  return { valid: true, parsed };
}
