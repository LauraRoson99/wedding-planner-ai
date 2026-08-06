import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from './passwords';

describe('passwords', () => {
  it('hashes a password to something different from the plaintext', async () => {
    const hash = await hashPassword('secret123');
    expect(hash).not.toBe('secret123');
    expect(hash.length).toBeGreaterThan(20);
  });

  it('verifies a correct password', async () => {
    const hash = await hashPassword('secret123');
    expect(await comparePassword('secret123', hash)).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('secret123');
    expect(await comparePassword('wrong-password', hash)).toBe(false);
  });
});
