// services/auth.service.ts
import { randomUUID } from 'crypto';
import { prisma } from '../db/prisma';
import { hashPassword, comparePassword } from '../utils/passwords';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt';

/**
 * Signs an access + refresh token pair and persists the refresh token's `jti`
 * so the session can be invalidated server-side (RF-84). The stored `jti` is
 * also what makes refresh-token rotation real: rotating deletes the old row.
 */
async function issueTokens(userId: string, email: string) {
  const jti = randomUUID();
  const access = signAccess({ sub: userId, email });
  const refresh = signRefresh({ sub: userId, jti });

  const decoded = verifyRefresh(refresh);
  const exp =
    typeof decoded === 'object' && decoded !== null && typeof (decoded as { exp?: number }).exp === 'number'
      ? (decoded as { exp: number }).exp
      : Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

  await prisma.refreshToken.create({
    data: { jti, userId, expiresAt: new Date(exp * 1000) },
  });

  return { access, refresh };
}

async function getOrCreateActiveWedding(userId: string) {
  const existingWedding = await prisma.wedding.findFirst({
    where: { ownerId: userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      date: true,
    },
  });

  if (existingWedding) return existingWedding;

  const createdWedding = await prisma.wedding.create({
    data: {
      name: 'Mi boda',
      ownerId: userId,
    },
    select: {
      id: true,
      name: true,
      date: true,
    },
  });

  return createdWedding;
}

export async function register(email: string, password: string, name?: string) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw { status: 409, message: 'Email already in use' };

  const hash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, password: hash, name },
  });

  const wedding = await getOrCreateActiveWedding(user.id);

  const { access, refresh } = await issueTokens(user.id, user.email);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    access,
    refresh,
    wedding,
  };
}

export async function refresh(refreshToken: string) {
  let payload: unknown;
  try {
    payload = verifyRefresh(refreshToken);
  } catch {
    throw { status: 401, message: 'Invalid refresh token' };
  }

  const claims =
    typeof payload === 'object' && payload !== null
      ? (payload as { sub?: string; jti?: string })
      : {};
  const userId = claims.sub;
  const jti = claims.jti;

  if (!userId || !jti) throw { status: 401, message: 'Invalid refresh token' };

  // The token must correspond to a live, non-expired session in the store.
  const stored = await prisma.refreshToken.findUnique({ where: { jti } });
  if (!stored || stored.userId !== userId || stored.expiresAt < new Date()) {
    throw { status: 401, message: 'Invalid refresh token' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw { status: 401, message: 'Invalid refresh token' };

  // Rotate: revoke the presented token, then issue (and store) a fresh pair.
  await prisma.refreshToken.delete({ where: { jti } });
  const tokens = await issueTokens(user.id, user.email);

  return tokens;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 401, message: 'Invalid credentials' };

  const ok = await comparePassword(password, user.password);
  if (!ok) throw { status: 401, message: 'Invalid credentials' };

  const wedding = await getOrCreateActiveWedding(user.id);

  const { access, refresh } = await issueTokens(user.id, user.email);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    access,
    refresh,
    wedding,
  };
}

export async function logout(refreshToken: string) {
  // Best-effort: decode to find the session id and revoke it. An invalid or
  // already-revoked token is treated as a successful logout (idempotent).
  try {
    const payload = verifyRefresh(refreshToken);
    const jti =
      typeof payload === 'object' && payload !== null
        ? (payload as { jti?: string }).jti
        : undefined;
    if (jti) {
      await prisma.refreshToken.deleteMany({ where: { jti } });
    }
  } catch {
    // Ignore: nothing to revoke.
  }

  return { ok: true };
}