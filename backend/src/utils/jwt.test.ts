import { describe, it, expect } from 'vitest';
import { signAccess, verifyAccess, signRefresh, verifyRefresh } from './jwt';

describe('jwt', () => {
  it('signs and verifies an access token round-trip', () => {
    const token = signAccess({ sub: 'user-1', email: 'a@b.com' });
    const payload = verifyAccess(token) as { sub?: string; email?: string };
    expect(payload.sub).toBe('user-1');
    expect(payload.email).toBe('a@b.com');
  });

  it('carries the jti in a refresh token', () => {
    const token = signRefresh({ sub: 'user-1', jti: 'session-1' });
    const payload = verifyRefresh(token) as { sub?: string; jti?: string };
    expect(payload.sub).toBe('user-1');
    expect(payload.jti).toBe('session-1');
  });

  it('rejects a tampered / invalid token', () => {
    expect(() => verifyAccess('not.a.valid.token')).toThrow();
  });
});
