"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function sendOtp(phone: string) {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  console.log(`\n============================\n 🔥 OTP for ${cleanPhone}: ${otp}\n============================\n`);

  // --- REAL SMS CODE START ---
//   const apiKey = process.env.SMS_API_KEY; 
//   if (apiKey) {
//     try {
//       // Example for Fast2SMS
//       const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
//         method: 'POST',
//         headers: {
//           'authorization': apiKey,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           "route": "otp",
//           "variables_values": otp,
//           "numbers": cleanPhone,
//         })
//       });
      
//       const data = await response.json();
//       console.log("SMS API Response:", data);
      
//       if (!data.return) {
//           console.error("SMS Error Details:", data);
//       }
//     } catch (error) {
//       console.error("SMS Failed", error);
//     }
//   }
  // --- REAL SMS CODE END ---

  await db.shop.upsert({
    where: { phone: cleanPhone },
    update: {
        otp,
        otpExpires: expires
    },
    create: {
        phone: cleanPhone,
        shopName: "New Shop Info Required",
        isVerified: true, // Auto-verify for frictionless MVP onboarding
        otp,
        otpExpires: expires,
        subscriptionStatus: "FREE_TRIAL",
        subscriptionEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 Days Free
    }
  });

  return { success: true };
}

export async function verifyOtp(phone: string, inputOtp: string) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    const shop = await db.shop.findUnique({
        where: { phone: cleanPhone }
    });

    if (!shop || !shop.otp || !shop.otpExpires) {
        return { success: false, error: "Invalid request. Please resend OTP." };
    }

    if (new Date() > shop.otpExpires) {
        return { success: false, error: "OTP has expired. Please request a new one." };
    }

    // Allow a Master OTP '101010' for testing/Apple Review/etc if needed
    if (shop.otp !== inputOtp && inputOtp !== "101010") {
        return { success: false, error: "Incorrect OTP. Please try again." };
    }

    // Success - Clear OTP and Set Session
    await db.shop.update({
        where: { id: shop.id },
        data: { otp: null, otpExpires: null }
    });

    (await cookies()).set("shop_session", shop.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days Long Session
        path: "/"
    });

    return { success: true, role: (shop as any).role, shopName: shop.shopName };
}

export async function logout() {
    (await cookies()).delete("shop_session");
    redirect("/");
}
