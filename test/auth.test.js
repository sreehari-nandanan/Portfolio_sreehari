import assert from 'node:assert';
import {
  sealSession,
  unsealSession,
  createOAuthState,
  validateOAuthState,
  parseCookies,
} from '../api/_lib/auth.js';

console.log('--- RUNNING AUTH UNIT TESTS ---');

const secret = 'test_secret_that_is_32_characters_long_12345';
const payload = {
  user: {
    id: 123456,
    login: 'sreehari-nandanan',
    name: 'Sreehari Nandanan',
  },
  expiresAt: Date.now() + 60000,
};

// 1. Seal & unseal valid session
const sealed = sealSession(payload, secret);
assert(typeof sealed === 'string', 'Sealed session should be string');
assert(sealed.split('.').length === 3, 'Sealed string must have iv.tag.cipher format');

const unsealed = unsealSession(sealed, secret);
assert.deepStrictEqual(unsealed.user, payload.user, 'Decrypted user must match original');
console.log('✓ Session sealing and unsealing passed');

// 2. Tampered session must fail
const parts = sealed.split('.');
const tampered = `${parts[0]}.${parts[1]}.${parts[2].slice(0, -2)}aa`;
const tamperedResult = unsealSession(tampered, secret);
assert.strictEqual(tamperedResult, null, 'Tampered session must return null');
console.log('✓ Tamper detection passed');

// 3. Expired session must return null
const expiredPayload = {
  user: { login: 'sreehari-nandanan' },
  expiresAt: Date.now() - 5000,
};
const expiredSealed = sealSession(expiredPayload, secret);
const expiredResult = unsealSession(expiredSealed, secret);
assert.strictEqual(expiredResult, null, 'Expired session must return null');
console.log('✓ Expiration check passed');

// 4. Cookie parser
const cookieHeader = 'portfolio_session=abc123xyz; portfolio_oauth_state=state789; other=value';
const parsed = parseCookies({ headers: { cookie: cookieHeader } });
assert.strictEqual(parsed.portfolio_session, 'abc123xyz');
assert.strictEqual(parsed.portfolio_oauth_state, 'state789');
console.log('✓ Cookie parsing passed');

// 5. OAuth state generation and validation
const { state, cookie } = createOAuthState(false);
assert(state && state.length === 64, 'State should be 32 bytes hex');
const stateReq = { headers: { cookie } };
assert.strictEqual(validateOAuthState(stateReq, state), true, 'Valid state must return true');
assert.strictEqual(validateOAuthState(stateReq, 'wrong_state'), false, 'Wrong state must return false');
console.log('✓ OAuth state validation passed');

console.log('ALL AUTH TESTS PASSED SUCCESSFULLY!');
