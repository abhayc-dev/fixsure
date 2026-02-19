
"use server";

import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function requestPasswordReset(email: string) {
  const normalizedEmail = email.toLowerCase();
  
  const shop = await db.shop.findUnique({
    where: { email: normalizedEmail }
  });

  if (!shop) {
    // Return success to avoid email enumeration attacks
    return { success: true };
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

  await db.shop.update({
    where: { id: shop.id },
    data: {
      resetToken: otp,
      resetTokenExpiry: expires
    }
  });

  const emailResult = await sendOtpEmail(normalizedEmail, otp);
  
  if (!emailResult.success) {
    return { success: false, error: "Failed to send OTP email" };
  }

  return { success: true };
}

export async function verifyResetToken(token: string) {
  const shop = await db.shop.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date()
      }
    }
  });

  return { valid: !!shop, email: shop?.email };
}

export async function verifyOtpForReset(email: string, otp: string) {
  const normalizedEmail = email.toLowerCase();
  
  const shop = await db.shop.findFirst({
    where: {
      email: normalizedEmail,
      resetToken: otp,
      resetTokenExpiry: {
        gt: new Date()
      }
    }
  });

  return { valid: !!shop };
}

export async function resetPassword(email: string, otp: string, newPassword: string) {
  const normalizedEmail = email.toLowerCase();

  const shop = await db.shop.findFirst({
    where: {
      email: normalizedEmail,
      resetToken: otp,
      resetTokenExpiry: {
        gt: new Date()
      }
    }
  });

  if (!shop) {
    return { success: false, error: "Invalid or expired OTP" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.shop.update({
    where: { id: shop.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    }
  });

  return { success: true };
}
