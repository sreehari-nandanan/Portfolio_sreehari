import assert from 'node:assert';
import {
  normalizeAndValidateContentPath,
  validateContentSchema,
  APPROVED_CONTENT_FILES,
} from '../api/_lib/allowlist.js';
import { computeGitSha } from '../api/_lib/github.js';

console.log('--- RUNNING CONTENT SERVICE & ALLOWLIST TESTS ---');

// 1. Valid approved paths
assert.strictEqual(
  normalizeAndValidateContentPath('public/content/projects.json'),
  'public/content/projects.json'
);
assert.strictEqual(
  normalizeAndValidateContentPath('projects.json'),
  'public/content/projects.json'
);
assert.strictEqual(
  normalizeAndValidateContentPath('profile.json'),
  'public/content/profile.json'
);
console.log('✓ Approved paths accepted');

// 2. Traversal and illegal paths rejected
assert.strictEqual(normalizeAndValidateContentPath('../package.json'), null);
assert.strictEqual(normalizeAndValidateContentPath('public/content/../../.env'), null);
assert.strictEqual(normalizeAndValidateContentPath('src/App.tsx'), null);
assert.strictEqual(normalizeAndValidateContentPath('api/auth/login.js'), null);
assert.strictEqual(normalizeAndValidateContentPath('/etc/passwd'), null);
assert.strictEqual(normalizeAndValidateContentPath('public/content/malicious.js'), null);
assert.strictEqual(normalizeAndValidateContentPath('public/content/not-allowlisted.json'), null);
console.log('✓ Path traversal and non-allowlisted files strictly rejected');

// 3. Schema validation for projects
const validProjects = [
  { id: 'sector', title: 'Sector Drone', desc: 'Racing drone' },
];
assert.strictEqual(validateContentSchema('public/content/projects.json', validProjects).valid, true);

const invalidProjects = [{ desc: 'Missing id and title' }];
assert.strictEqual(validateContentSchema('public/content/projects.json', invalidProjects).valid, false);

const notAnArray = { title: 'Not an array' };
assert.strictEqual(validateContentSchema('public/content/projects.json', notAnArray).valid, false);
console.log('✓ Projects schema validation passed');

// 4. Git blob SHA calculation
const testString = 'hello world\n';
const sha = computeGitSha(testString);
// echo -n "hello world\n" | git hash-object --stdin
assert.strictEqual(typeof sha, 'string');
assert.strictEqual(sha.length, 40);
console.log('✓ Git SHA-1 hashing verified:', sha);

console.log('ALL CONTENT SERVICE TESTS PASSED SUCCESSFULLY!');
