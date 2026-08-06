import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { errorHandler } from './error';

function mockRes() {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn((body: unknown) => {
    res.body = body;
    return res;
  });
  return res;
}

const noopNext = () => {};

describe('errorHandler (RNF-22)', () => {
  it('maps a ZodError to 400 with a readable message and details', () => {
    let err: unknown;
    try {
      z.object({ email: z.string().email() }).parse({ email: 'not-an-email' });
    } catch (e) {
      err = e;
    }

    const res = mockRes();
    errorHandler(err, {} as any, res, noopNext as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(typeof res.body.error).toBe('string');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it('passes through a { status, message } thrown by a service', () => {
    const res = mockRes();
    errorHandler({ status: 409, message: 'Email already in use' }, {} as any, res, noopNext as any);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.body.error).toBe('Email already in use');
  });

  it('hides internal error details behind a generic 500', () => {
    const res = mockRes();
    errorHandler(new Error('DB connection exploded'), {} as any, res, noopNext as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.body.error).not.toContain('DB connection exploded');
  });
});
