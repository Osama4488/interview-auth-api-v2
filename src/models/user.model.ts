// src/models/user.model.ts
import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;             // hashed
  avatarUrl?: string;
  role: "user" | "admin";
  isEmailVerified: boolean;

  // 2FA
  twoFactorEnabled: boolean;
  otpCodeHash?: string | null;   // store hash, not the raw OTP
  otpExpiresAt?: Date | null;
  otpAttempts?: number;

  comparePassword(candidate: string): Promise<boolean>;
  setOtp(rawOtp: string, ttlMinutes: number): Promise<void>;
  verifyOtp(rawOtp: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    avatarUrl: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isEmailVerified: { type: Boolean, default: false },

    twoFactorEnabled: { type: Boolean, default: true },
    otpCodeHash: { type: String, default: null, select: false },
    otpExpiresAt: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

// Hide password in JSON
UserSchema.set("toJSON", {
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.password;
    delete ret.otpCodeHash;
    return ret;
  },
});

// Hash password on save if modified
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.setOtp = async function (rawOtp: string, ttlMinutes: number) {
  const salt = await bcrypt.genSalt(10);
  this.otpCodeHash = await bcrypt.hash(rawOtp, salt);
  const now = new Date();
  this.otpExpiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
  this.otpAttempts = 0;
  await this.save();
};

UserSchema.methods.verifyOtp = async function (rawOtp: string) {
  // Basic checks
  if (!this.otpCodeHash || !this.otpExpiresAt) return false;
  if (this.otpExpiresAt.getTime() < Date.now()) return false;

  // Optional throttle
  if ((this.otpAttempts ?? 0) >= 5) return false;

  const ok = await bcrypt.compare(rawOtp, this.otpCodeHash);
  this.otpAttempts = (this.otpAttempts ?? 0) + 1;

  if (ok) {
    // clear OTP after success
    this.otpCodeHash = null;
    this.otpExpiresAt = null;
    this.otpAttempts = 0;
  }
  await this.save();
  return ok;
};

const User = model<IUser>("User", UserSchema);
export default User;
