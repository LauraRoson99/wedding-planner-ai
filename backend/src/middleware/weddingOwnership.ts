import { Request, Response, NextFunction } from "express";
import { prisma } from "../db/prisma";

function getUserId(req: Request) {
  const user = (req as any).user;
  return user?.userId ?? user?.id ?? user?.sub;
}

/**
 * Enforces that the caller owns the wedding referenced by `weddingId`
 * (query or body). Requests without a `weddingId` (e.g. by-id routes) pass
 * through untouched — those must scope by ownership at the service layer.
 *
 * Must run after `requireAuth`, which attaches `req.user`.
 */
export async function requireWeddingOwnership(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = req.query.weddingId ?? (req.body ? req.body.weddingId : undefined);
    if (raw === undefined || raw === null || raw === "") {
      return next();
    }

    const weddingId = String(raw);
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Invalid user session" });
    }

    const owned = await prisma.wedding.findFirst({
      where: { id: weddingId, ownerId: userId },
      select: { id: true },
    });

    if (!owned) {
      return res.status(404).json({ error: "Wedding not found" });
    }

    next();
  } catch (e) {
    next(e);
  }
}
