// src/config/env.ts
import path from "path";
import dotenv from "dotenv";
import { StringValue } from "ms";

// If your .env lives in <project>/server/.env:
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
// If you later move .env to the project root, just do: dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const env = {
 port: Number(process.env.PORT ?? 4001),
  mongoUri: required("MONGO_URI"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  accessTtl: (process.env.ACCESS_TOKEN_TTL ?? "2h") as StringValue,
  refreshTtl: (process.env.REFRESH_TOKEN_TTL ?? "30d") as StringValue,
   resendApiKey: required("RESEND_API_KEY"),       // 👈 require it
  mailFrom: required("MAIL_FROM"),   
  cookieSecure: String(process.env.COOKIE_SECURE ?? "false") === "true",
  otpEnabled: String(process.env.OTP_ENABLED ?? "true") === "true",
};
