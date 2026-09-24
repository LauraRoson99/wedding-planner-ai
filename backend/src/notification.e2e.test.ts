import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from './app';
import { prisma } from './db/prisma';

// Integration tests run against the real (dev) database and clean up after themselves.
const email = `vitest-notif+${Date.now()}@test.com`;

describe('e2e: recordatorios leídos/no leídos (RF-95)', () => {
  let token = '';
  let weddingId = '';
  let taskKey = '';

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('creates a task due soon that shows up as unread', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'test123', name: 'Vitest' });
    token = reg.body.access;
    weddingId = reg.body.wedding.id;

    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const task = await request(app)
      .post(`/api/tasks?weddingId=${weddingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Probar recordatorio', dueDate, weddingId });
    expect(task.status).toBe(201);
    taskKey = `task:${task.body.id}`;

    const res = await request(app)
      .get(`/api/notifications?weddingId=${weddingId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const item = res.body.notifications.find((n: { id: string }) => n.id === taskKey);
    expect(item?.read).toBe(false);
    expect(res.body.counts.unread).toBe(1);
  });

  it('marks the reminder as read and keeps it read on the next fetch', async () => {
    const marked = await request(app)
      .post('/api/notifications/read')
      .set('Authorization', `Bearer ${token}`)
      .send({ weddingId, keys: [taskKey] });

    expect(marked.status).toBe(200);
    expect(marked.body.counts.unread).toBe(0);

    const res = await request(app)
      .get(`/api/notifications?weddingId=${weddingId}`)
      .set('Authorization', `Bearer ${token}`);

    const item = res.body.notifications.find((n: { id: string }) => n.id === taskKey);
    expect(item?.read).toBe(true);
    expect(res.body.counts.total).toBe(1);
    expect(res.body.counts.unread).toBe(0);
  });

  it('turns the reminder unread again when its due date changes', async () => {
    const dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    await request(app)
      .put(`/api/tasks/${taskKey.split(':')[1]}?weddingId=${weddingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ dueDate, weddingId });

    const res = await request(app)
      .get(`/api/notifications?weddingId=${weddingId}`)
      .set('Authorization', `Bearer ${token}`);

    const item = res.body.notifications.find((n: { id: string }) => n.id === taskKey);
    expect(item?.read).toBe(false);
    expect(res.body.counts.unread).toBe(1);
  });

  it('marks every reminder as read when no keys are sent', async () => {
    const marked = await request(app)
      .post('/api/notifications/read')
      .set('Authorization', `Bearer ${token}`)
      .send({ weddingId });

    expect(marked.status).toBe(200);
    expect(marked.body.counts.unread).toBe(0);
    expect(marked.body.notifications.every((n: { read: boolean }) => n.read)).toBe(true);
  });

  it('rejects marking reminders of a wedding the user does not own', async () => {
    const res = await request(app)
      .post('/api/notifications/read')
      .set('Authorization', `Bearer ${token}`)
      .send({ weddingId: 'not-my-wedding-id' });

    expect(res.status).toBe(404);
  });
});
