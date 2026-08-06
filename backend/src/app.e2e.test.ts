import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from './app';
import { prisma } from './db/prisma';

// Integration tests run against the real (dev) database and clean up after themselves.
const email = `vitest+${Date.now()}@test.com`;

describe('e2e: registro → boda → invitado', () => {
  let token = '';
  let weddingId = '';

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('register creates the user and auto-creates a wedding', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'test123', name: 'Vitest' });

    expect(res.status).toBe(201);
    expect(res.body.access).toBeTruthy();
    expect(res.body.wedding?.id).toBeTruthy();

    token = res.body.access;
    weddingId = res.body.wedding.id;
  });

  it('rejects a duplicate registration with 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'test123' });

    expect(res.status).toBe(409);
  });

  it('creates and lists a guest under the wedding', async () => {
    const created = await request(app)
      .post(`/api/guests?weddingId=${weddingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Invitado Test', email: 'guest@test.com' });

    expect(created.status).toBe(201);
    expect(created.body.id).toBeTruthy();

    const list = await request(app)
      .get(`/api/guests?weddingId=${weddingId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(list.status).toBe(200);
    expect(list.body.some((g: { name: string }) => g.name === 'Invitado Test')).toBe(true);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get(`/api/guests?weddingId=${weddingId}`);
    expect(res.status).toBe(401);
  });

  it('blocks access to a wedding the user does not own (RNF-01)', async () => {
    const res = await request(app)
      .get('/api/guests?weddingId=not-my-wedding-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('returns 400 with a clean message on invalid input (RNF-22)', async () => {
    const res = await request(app)
      .post(`/api/guests?weddingId=${weddingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
  });
});
