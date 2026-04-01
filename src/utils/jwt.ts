// src/utils/jwt.ts
import jwt from "jsonwebtoken";
import type { SignOptions, Secret } from "jsonwebtoken";
import { env } from "../config/env";

// NARROW types so TS picks the right overloads
const ACCESS_EXPIRES_IN: SignOptions["expiresIn"] = env.accessTtl as any;   // e.g. "15m" or 900
const REFRESH_EXPIRES_IN: SignOptions["expiresIn"] = env.refreshTtl as any; // e.g. "7d" or 604800
const ACCESS_SECRET: Secret = env.jwtAccessSecret as Secret;
const REFRESH_SECRET: Secret = env.jwtRefreshSecret as Secret;

const baseOpts: SignOptions = { algorithm: "HS256" };

export function signAccess(payload: object) {
  return jwt.sign(payload, ACCESS_SECRET, { ...baseOpts, expiresIn: ACCESS_EXPIRES_IN });
}

export function signRefresh(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, { ...baseOpts, expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyAccess<T = any>(token: string): T | null {
  try { return jwt.verify(token, ACCESS_SECRET) as T; } catch { return null; }
}
export function verifyRefresh<T = any>(token: string): T | null {
  try { return jwt.verify(token, REFRESH_SECRET) as T; } catch { return null; }
}
