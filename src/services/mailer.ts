import { Resend } from "resend";
import { env } from "../config/env";

const isProd = process.env.NODE_ENV === "production";

export async function sendOtpEmail(to: string, otp: string) {
  // If OTP is disabled, do nothing.
  if (!env.otpEnabled) {
    console.log("OTP is disabled. Skipping email send.");
    return;
  }

  // In dev, print OTP instead of sending email.
  if (!isProd) {
    console.log(`DEV OTP for ${to}: ${otp} (valid 5 min)`);
    return;
  }

  // At this point OTP is enabled, so these must exist.
  if (!env.resendApiKey || !env.mailFrom) {
    throw new Error("Missing email configuration for OTP delivery");
  }

  const resend = new Resend(env.resendApiKey);

  const { data, error } = await resend.emails.send({
    from: env.mailFrom,
    to,
    subject: "Your OTP Code",
    html: `<p>Your OTP is: <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message || "Failed to send email");
  }

  console.log("Resend OK, id:", data?.id, "to:", to);
}