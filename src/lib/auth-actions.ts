"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234567";

export async function loginWithEmail(email: string, password: string) {
    const normalizedEmail = email.toLowerCase();
    
    // Check for hardcoded Admin
    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Create or get Admin user in DB
        let admin = await db.shop.findUnique({ where: { email : ADMIN_EMAIL } });
        if (!admin) {
            admin = await db.shop.create({
                data: {
                    email: ADMIN_EMAIL,
                    phone: "0000000000", // Placeholder for admin
                    shopName: "Admin Dashboard",
                    role: "ADMIN",
                    password: await bcrypt.hash(ADMIN_PASSWORD, 10),
                    isVerified: true,
                }
            });
        }

        (await cookies()).set("shop_session", admin.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/"
        });

        return { success: true, role: "ADMIN" };
    }

    const shop = await db.shop.findUnique({
        where: { email: normalizedEmail }
    });

    if (!shop || !shop.password) {
        return { success: false, error: "Invalid email or password" };
    }

    const isMatch = await bcrypt.compare(password, shop.password);
    if (!isMatch) {
        return { success: false, error: "Invalid email or password" };
    }

    (await cookies()).set("shop_session", shop.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/"
    });

    return { success: true, role: shop.role, shopName: shop.shopName };
}

export async function signup(data: { email: string; password: string; phone: string; shopName: string }) {
    const { password, phone, shopName } = data;
    const email = data.email.toLowerCase();

    if (!phone || phone.length < 10) {
        return { success: false, error: "Mobile number is mandatory" };
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    const existingEmail = await db.shop.findUnique({ where: { email } });
    if (existingEmail) return { success: false, error: "Email already registered" };

    const existingPhone = await db.shop.findUnique({ where: { phone: cleanPhone } });
    if (existingPhone) return { success: false, error: "Phone number already registered" };

    const hashedPassword = await bcrypt.hash(password, 10);

    const shop = await db.shop.create({
        data: {
            email,
            password: hashedPassword,
            phone: cleanPhone,
            shopName,
            isVerified: true,
            subscriptionStatus: "FREE_TRIAL",
            subscriptionEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
    });

    (await cookies()).set("shop_session", shop.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/"
    });

    return { success: true, shopName: shop.shopName };
}

export async function googleLogin(data: { email: string; name: string; googleId: string; phone?: string; shopName?: string }) {
    const { name, phone, shopName } = data;
    const email = data.email.toLowerCase();

    let shop = await db.shop.findUnique({
        where: { email }
    });

    if (!shop) {
        // If shop doesn't exist, we need the phone number to create it
        if (!phone) {
            return { success: false, needsPhone: true, email, name };
        }

        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        const existingPhone = await db.shop.findUnique({ where: { phone: cleanPhone } });
        if (existingPhone) return { success: false, error: "Phone number already registered with another account" };

        shop = await db.shop.create({
            data: {
                email,
                ownerName: name,
                phone: cleanPhone,
                shopName: shopName || (name + "'s Shop"),
                isVerified: true,
                subscriptionStatus: "FREE_TRIAL",
                subscriptionEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            }
        });
    }

    const sessionId = shop.id;
    console.log(`DEBUG: Setting session cookie for shop ${sessionId} (Production: ${process.env.NODE_ENV === "production"})`);

    (await cookies()).set("shop_session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "lax"
    });

    return { success: true, role: shop.role, shopName: shop.shopName };
}

export async function logout() {
    (await cookies()).delete("shop_session");
    redirect("/");
}

export async function checkEmailExists(email: string) {
    try {
        const shop = await db.shop.findUnique({
            where: { email },
            select: { id: true }
        });
        return { exists: !!shop };
    } catch (error) {
        return { exists: false };
    }
}

// Keeping these for potential legacy use or migration
export async function sendOtp(phone: string) {
    return { success: false, error: "OTP login is deprecated. Please use Email login." };
}

export async function verifyOtp(phone: string, inputOtp: string) {
    return { success: false, error: "OTP login is deprecated. Please use Email login." };
}
