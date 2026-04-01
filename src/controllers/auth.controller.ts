import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import { generateNumericOtp } from "../utils/otp";
import { sendOtpEmail } from "../services/mailer";
import { signAccess, signRefresh, verifyRefresh } from "../utils/jwt";
import { env } from "../config/env";
import ms from "ms";
import type { StringValue } from "ms";
// ---------- helpers ----------
import type { Response as ExResponse } from "express";

const accessMaxAge = ms(env.accessTtl as StringValue);
const refreshMaxAge = ms(env.refreshTtl as StringValue);
function cookieOptions(secure: boolean, maxAgeMs: number) {
  return {
    httpOnly: true,
    sameSite: (secure ? "none" : "lax") as "none" | "lax",
    secure,
    path: "/",
    maxAge: maxAgeMs,
  };
}
function setAuthCookies(res: ExResponse, access: string, refresh: string, secure: boolean) {



  res.cookie("accessToken", access, cookieOptions(secure, accessMaxAge));
  res.cookie("refreshToken", refresh, { ...cookieOptions(secure, refreshMaxAge), httpOnly: true });
}

// ---------- controllers ----------
/** POST /api/auth/signup */
/** POST /api/auth/signup */
// export async function signup(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { name, email, password } = req.body;

//     // 1) Check duplicate (gives cleaner error than raw Mongo E11000)
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(409).json({ message: "Email already exists" });

//     // 2) Create user (hashed by pre-save hook)
//     const user = await User.create({ name, email, password });



//     // 3) Generate OTP and store it on the user
//     const otp = generateNumericOtp(6);
//     // Make sure setOtp exists on your model and sets hash+expiry+attempts
//     await user.setOtp(otp, 5);

//     // 4) Send OTP (DEV mode will console.log it if you implemented that switch)
//     await sendOtpEmail(user.email, otp);

//     // 5) Respond
//     return res.status(201).json({
//       ok: true,
//       requires2FA: true,
//       message: "Account created. OTP sent to email.",
//     });
//   } catch (e) {
//     next(e);
//   }
// }

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already exists" });

    const user = await User.create({ name, email, password });

    // ✅ OTP disabled: finish signup normally
    if (!env.otpEnabled) {
      return res.status(201).json({
        ok: true,
        requires2FA: false,
        message: "Account created.",
      });
    }

    // OTP enabled: generate + store + send
    const otp = generateNumericOtp(6);
    await user.setOtp(otp, 5);
    await sendOtpEmail(user.email, otp);

    return res.status(201).json({
      ok: true,
      requires2FA: true,
      message: "Account created. OTP sent to email.",
    });
  } catch (e) {
    next(e);
  }
}

/** POST /api/auth/login  (password step) */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .select("+password +otpCodeHash +otpExpiresAt +otpAttempts");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // if (!user.twoFactorEnabled) {
    //   const access = signAccess({ sub: user.id, role: user.role });
    //   const refresh = signRefresh({ sub: user.id });
    //   setAuthCookies(res, access, refresh, env.cookieSecure);
    //   return res.json({ requires2FA: false, user });
    // }

    // ✅ If OTP is disabled OR user doesn't have 2FA → issue tokens immediately
    if (!env.otpEnabled || !user.twoFactorEnabled) {
      const access = signAccess({ sub: user.id, role: user.role });
      const refresh = signRefresh({ sub: user.id });
      setAuthCookies(res, access, refresh, env.cookieSecure);
      return res.json({ requires2FA: false, user });
    }

    const otp = generateNumericOtp(6);
    await user.setOtp(otp, 5); // 5 minutes validity
    await sendOtpEmail(user.email, otp);
    res.json({ requires2FA: true, message: "OTP sent to email" });
  } catch (e) { next(e); }
}

/** POST /api/auth/verify-otp  (final step → JWT) */
export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    if (!env.otpEnabled) {
      return res.status(400).json({ message: "OTP is disabled" });
    }
    const { email, otp } = req.body;
    const user = await User.findOne({ email })
      .select("+otpCodeHash +otpExpiresAt +otpAttempts");
    if (!user) return res.status(400).json({ message: "User not found" });

    const ok = await user.verifyOtp(otp);
    if (!ok) return res.status(400).json({ message: "Invalid or expired code" });

    const access = signAccess({ sub: user.id, role: user.role });
    const refresh = signRefresh({ sub: user.id });
    setAuthCookies(res, access, refresh, env.cookieSecure);
    res.json({ user });
  } catch (e) { next(e); }
}

/** POST /api/auth/refresh */
export async function refreshToken(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  const payload = verifyRefresh<{ sub: string }>(token);
  if (!payload) return res.status(401).json({ message: "Invalid refresh token" });

  const access = signAccess({ sub: payload.sub });
  res.cookie("accessToken", access, cookieOptions(env.cookieSecure, accessMaxAge));
  res.json({ ok: true });
}

/** POST /api/auth/logout */
export function logout(_req: Request, res: Response) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ ok: true });
}

/** GET /api/auth/me  (requires access token) */
export async function me(req: Request, res: Response) {
  res.json({ userId: req.user?.sub });
}
