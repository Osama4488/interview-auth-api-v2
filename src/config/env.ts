// src/config/env.ts
import path from "path";
import dotenv from "dotenv";
import { StringValue } from "ms";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const otpEnabled = String(process.env.OTP_ENABLED ?? "true") === "true";

export const env = {
  port: Number(process.env.PORT ?? 4001),
  mongoUri: required("MONGO_URI"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  accessTtl: (process.env.ACCESS_TOKEN_TTL ?? "2h") as StringValue,
  refreshTtl: (process.env.REFRESH_TOKEN_TTL ?? "30d") as StringValue,
  cookieSecure: String(process.env.COOKIE_SECURE ?? "false") === "true",
  otpEnabled,

  resendApiKey: otpEnabled ? required("RESEND_API_KEY") : undefined,
  mailFrom: otpEnabled ? required("MAIL_FROM") : undefined,
};