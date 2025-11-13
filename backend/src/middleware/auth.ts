// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = header.substring('Bearer '.length);
  try {
    const payload = verifyAccess(token);
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
