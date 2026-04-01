import type { NextFunction, Request, Response } from "express";
import { verifyAccess } from "../utils/jwt";

// augment Express types so req.user is typed
declare global {
  namespace Express {
    interface Request {
      user?: { sub: string; role?: string };
    }
  }
}

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const token = bearer || req.cookies?.accessToken;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const payload = verifyAccess<{ sub: string; role?: string }>(token);
  if (!payload) return res.status(401).json({ message: "Invalid token" });

  req.user = payload;
  next();
}
