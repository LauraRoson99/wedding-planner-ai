// services/auth.service.ts
import { prisma } from '../db/prisma';
import { hashPassword, comparePassword } from '../utils/passwords';
import { signAccess, signRefresh } from '../utils/jwt';

export async function register(email: string, password: string, name?: string) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw { status: 409, message: 'Email already in use' };
  const hash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, password: hash, name } });
  const access = signAccess({ sub: user.id, email: user.email });
  const refresh = signRefresh({ sub: user.id });
  return { user: { id: user.id, email: user.email, name: user.name }, access, refresh };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 401, message: 'Invalid credentials' };
  const ok = await comparePassword(password, user.password);
  if (!ok) throw { status: 401, message: 'Invalid credentials' };
  const access = signAccess({ sub: user.id, email: user.email });
  const refresh = signRefresh({ sub: user.id });
  return { user: { id: user.id, email: user.email, name: user.name }, access, refresh };
}
