// src/services/mailer.ts
import { Resend } from "resend";
import { env } from "@config/env";

const isProd = process.env.NODE_ENV === "production";

// Only initialize Resend in production.
// In dev, you can keep your flow working without relying on email provider delivery.
const resend = isProd ? new Resend(env.resendApiKey) : null;

export async function sendOtpEmail(to: string, otp: string) {
  // ✅ DEV MODE: let users use maildrop/mailsac/anything, and just print OTP.
  if (!isProd) {
    console.log(`✅ DEV OTP for ${to}: ${otp} (valid 5 min)`);
    console.log(`(If you're using maildrop.cc, inbox is public. Use only for testing.)`);
    return;
  }

  // ✅ PROD MODE: send real email
  const { data, error } = await resend!.emails.send({
    from: env.mailFrom, // must be a verified sender/domain in Resend for real sending
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
