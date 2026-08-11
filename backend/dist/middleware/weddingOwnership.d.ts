import { Request, Response, NextFunction } from "express";
/**
 * Enforces that the caller owns the wedding referenced by `weddingId`
 * (query or body). Requests without a `weddingId` (e.g. by-id routes) pass
 * through untouched — those must scope by ownership at the service layer.
 *
 * Must run after `requireAuth`, which attaches `req.user`.
 */
export declare function requireWeddingOwnership(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=weddingOwnership.d.ts.map