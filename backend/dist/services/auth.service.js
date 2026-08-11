"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.refresh = refresh;
exports.login = login;
exports.logout = logout;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.changePassword = changePassword;
// services/auth.service.ts
const crypto_1 = require("crypto");
const prisma_1 = require("../db/prisma");
const passwords_1 = require("../utils/passwords");
const jwt_1 = require("../utils/jwt");
const mailer_1 = require("../utils/mailer");
const password_reset_template_1 = require("./password-reset.template");
const env_1 = require("../config/env");
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
function hashResetToken(rawToken) {
    return (0, crypto_1.createHash)('sha256').update(rawToken).digest('hex');
}
/**
 * Signs an access + refresh token pair and persists the refresh token's `jti`
 * so the session can be invalidated server-side (RF-84). The stored `jti` is
 * also what makes refresh-token rotation real: rotating deletes the old row.
 */
async function issueTokens(userId, email) {
    const jti = (0, crypto_1.randomUUID)();
    const access = (0, jwt_1.signAccess)({ sub: userId, email });
    const refresh = (0, jwt_1.signRefresh)({ sub: userId, jti });
    const decoded = (0, jwt_1.verifyRefresh)(refresh);
    const exp = typeof decoded === 'object' && decoded !== null && typeof decoded.exp === 'number'
        ? decoded.exp
        : Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    await prisma_1.prisma.refreshToken.create({
        data: { jti, userId, expiresAt: new Date(exp * 1000) },
    });
    return { access, refresh };
}
async function getOrCreateActiveWedding(userId) {
    const existingWedding = await prisma_1.prisma.wedding.findFirst({
        where: { ownerId: userId },
        orderBy: { updatedAt: 'desc' },
        select: {
            id: true,
            name: true,
            date: true,
        },
    });
    if (existingWedding)
        return existingWedding;
    const createdWedding = await prisma_1.prisma.wedding.create({
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
async function register(email, password, name) {
    const exists = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (exists)
        throw { status: 409, message: 'Email already in use' };
    const hash = await (0, passwords_1.hashPassword)(password);
    const user = await prisma_1.prisma.user.create({
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
async function refresh(refreshToken) {
    let payload;
    try {
        payload = (0, jwt_1.verifyRefresh)(refreshToken);
    }
    catch {
        throw { status: 401, message: 'Invalid refresh token' };
    }
    const claims = typeof payload === 'object' && payload !== null
        ? payload
        : {};
    const userId = claims.sub;
    const jti = claims.jti;
    if (!userId || !jti)
        throw { status: 401, message: 'Invalid refresh token' };
    // The token must correspond to a live, non-expired session in the store.
    const stored = await prisma_1.prisma.refreshToken.findUnique({ where: { jti } });
    if (!stored || stored.userId !== userId || stored.expiresAt < new Date()) {
        throw { status: 401, message: 'Invalid refresh token' };
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw { status: 401, message: 'Invalid refresh token' };
    // Rotate: revoke the presented token, then issue (and store) a fresh pair.
    await prisma_1.prisma.refreshToken.delete({ where: { jti } });
    const tokens = await issueTokens(user.id, user.email);
    return tokens;
}
async function login(email, password) {
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        throw { status: 401, message: 'Invalid credentials' };
    const ok = await (0, passwords_1.comparePassword)(password, user.password);
    if (!ok)
        throw { status: 401, message: 'Invalid credentials' };
    const wedding = await getOrCreateActiveWedding(user.id);
    const { access, refresh } = await issueTokens(user.id, user.email);
    return {
        user: { id: user.id, email: user.email, name: user.name },
        access,
        refresh,
        wedding,
    };
}
async function logout(refreshToken) {
    // Best-effort: decode to find the session id and revoke it. An invalid or
    // already-revoked token is treated as a successful logout (idempotent).
    try {
        const payload = (0, jwt_1.verifyRefresh)(refreshToken);
        const jti = typeof payload === 'object' && payload !== null
            ? payload.jti
            : undefined;
        if (jti) {
            await prisma_1.prisma.refreshToken.deleteMany({ where: { jti } });
        }
    }
    catch {
        // Ignore: nothing to revoke.
    }
    return { ok: true };
}
async function forgotPassword(email) {
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    // Do not reveal whether the email exists.
    if (!user)
        return { ok: true };
    // Invalidate any previous reset tokens for this user.
    await prisma_1.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    const rawToken = (0, crypto_1.randomBytes)(32).toString('hex');
    await prisma_1.prisma.passwordResetToken.create({
        data: {
            tokenHash: hashResetToken(rawToken),
            userId: user.id,
            expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
        },
    });
    const resetUrl = `${env_1.env.appBaseUrl}/reset-password/${rawToken}`;
    const { subject, html, text } = (0, password_reset_template_1.renderPasswordResetEmail)(resetUrl);
    const info = await (0, mailer_1.sendMail)({ to: user.email, subject, html, text });
    if (env_1.env.nodeEnv !== 'production') {
        // Dev aid: surface the link (Ethereal doesn't deliver to real inboxes).
        console.log(`[password-reset] ${user.email} -> ${resetUrl}`);
        if (info.previewUrl)
            console.log(`[password-reset] preview: ${info.previewUrl}`);
    }
    return { ok: true };
}
async function resetPassword(rawToken, newPassword) {
    const record = await prisma_1.prisma.passwordResetToken.findUnique({
        where: { tokenHash: hashResetToken(rawToken) },
    });
    if (!record || record.expiresAt < new Date()) {
        throw { status: 400, message: 'El enlace de restablecimiento no es válido o ha caducado' };
    }
    const hash = await (0, passwords_1.hashPassword)(newPassword);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.update({ where: { id: record.userId }, data: { password: hash } }),
        // Consume all reset tokens for this user.
        prisma_1.prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
        // Revoke every active session — a password reset ends all logins.
        prisma_1.prisma.refreshToken.deleteMany({ where: { userId: record.userId } }),
    ]);
    return { ok: true };
}
async function getProfile(userId) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
    });
    if (!user)
        throw { status: 401, message: 'Invalid user session' };
    return user;
}
async function updateProfile(userId, data) {
    if (data.email !== undefined) {
        const taken = await prisma_1.prisma.user.findFirst({
            where: { email: data.email, id: { not: userId } },
            select: { id: true },
        });
        if (taken)
            throw { status: 409, message: 'Email already in use' };
    }
    const user = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.email !== undefined && { email: data.email }),
        },
        select: { id: true, email: true, name: true },
    });
    return user;
}
async function changePassword(userId, currentPassword, newPassword) {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw { status: 401, message: 'Invalid user session' };
    const ok = await (0, passwords_1.comparePassword)(currentPassword, user.password);
    if (!ok)
        throw { status: 400, message: 'La contraseña actual no es correcta' };
    const hash = await (0, passwords_1.hashPassword)(newPassword);
    await prisma_1.prisma.user.update({ where: { id: userId }, data: { password: hash } });
    return { ok: true };
}
//# sourceMappingURL=auth.service.js.map