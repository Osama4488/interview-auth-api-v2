import { Router } from "express";
import { signup, login, verifyOtp, refreshToken, logout, me } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { signupSchema, loginSchema, verifyOtpSchema } from "../controllers/schemas";
import { authGuard } from "../middlewares/authGuard";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", authGuard, me);

export default router;
