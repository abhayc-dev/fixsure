"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { cache } from "react";

// Helper to get authorized shop from session - Memoized for the duration of a single request
export const getCurrentShop = cache(async () => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("shop_session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const shop = await db.shop.findUnique({
    where: { id: sessionId },
  });

  if (!shop) {
    redirect("/login");
  }

  return shop;
});

export async function createWarranty(formData: FormData) {
  const shop = await getCurrentShop();

  const customerName = formData.get("customer") as string;
  const customerPhone = formData.get("phone") as string;
  const customerAddress = formData.get("address") as string;
  const deviceModel = formData.get("device") as string;
  const repairType = formData.get("issue") as string;
  const duration = parseInt(formData.get("duration") as string);
  const repairCost = parseFloat(formData.get("price") as string) || 0;

  const shortCode = `FS-${Math.floor(Math.random() * 90000) + 10000}`; // 5 digit random

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + duration);

  if (!shop.isVerified) {
    throw new Error("Your shop is blocked by Admin. Contact support.");
  }

  if (shop.subscriptionStatus !== 'ACTIVE' && shop.subscriptionStatus !== 'FREE_TRIAL') {
    throw new Error("Subscription Expired. Please recharge.");
  }

  if (shop.subscriptionEnds && new Date() > shop.subscriptionEnds) {
    await db.shop.update({
      where: { id: shop.id },
      data: { subscriptionStatus: "EXPIRED" }
    });
    throw new Error("Plan Expired. Please recharge to issue new warranties.");
  }

  await db.warranty.create({
    data: {
      shortCode,
      customerName,
      customerPhone,
      customerAddress,
      deviceModel,
      repairType,
      repairCost,
      durationDays: duration,
      issuedAt: new Date(), // Explicit server time to match analytics
      expiresAt: expiresAt,
      shopId: shop.id,
      status: "ACTIVE",
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getWarranties() {
  const shop = await getCurrentShop();

  return await db.warranty.findMany({
    where: { shopId: shop.id },
    orderBy: { issuedAt: "desc" },
  });
}

export async function getWarrantyById(id: string) {
  const shop = await getCurrentShop();
  const warranty = await db.warranty.findUnique({
    where: { id },
    include: { shop: true }
  });

  if (!warranty || warranty.shopId !== shop.id) {
    return null; // Or throw error, but null is safer for page handling
  }
  return warranty;
}

export async function getWarrantyByCode(code: string) {
  return await db.warranty.findUnique({
    where: { shortCode: code },
    include: { shop: true },
  });
}

export async function getStats() {
    const shop = await getCurrentShop();
    const now = new Date();
    
    // 1. Fetch all warranties from the last 12 months in ONE query
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const warranties = await db.warranty.findMany({
        where: { 
            shopId: shop.id,
            issuedAt: { gte: twelveMonthsAgo }
        },
        select: {
            repairCost: true,
            issuedAt: true,
            status: true
        }
    });

    // 2. Fundamental Stats (Using pre-fetched data for speed)
    const total = await db.warranty.count({ where: { shopId: shop.id } }); // Total all time
    const active = warranties.filter(w => w.status === "ACTIVE").length;
    
    const revenueAgg = await db.warranty.aggregate({
        _sum: { repairCost: true },
        where: { shopId: shop.id }
    });

    // 3. Memory-based Aggregations (Blazing Fast)
    const weeklyChart = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayStart = new Date(d.setHours(0,0,0,0));
        const dayEnd = new Date(d.setHours(23,59,59,999));
        
        const dayTotal = warranties
            .filter(w => w.issuedAt >= dayStart && w.issuedAt <= dayEnd)
            .reduce((sum, w) => sum + (w.repairCost || 0), 0);

        return {
            label: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
            value: dayTotal
        };
    });

    const monthlyResults = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const month = d.getMonth();
        const year = d.getFullYear();

        const monthWarranties = warranties.filter(w => {
            const wDate = new Date(w.issuedAt);
            return wDate.getMonth() === month && wDate.getFullYear() === year;
        });

        const revenue = monthWarranties.reduce((sum, w) => sum + (w.repairCost || 0), 0);
        const jobs = monthWarranties.length;

        return {
            label: d.toLocaleDateString('en-US', { month: 'short' }),
            revenue,
            jobs
        };
    });

    const monthlyChart = monthlyResults.map(r => ({ label: r.label, value: r.revenue }));
    const jobChart = monthlyResults.map(r => ({ label: r.label, value: r.jobs }));
    
    // Current Month Revenue
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = warranties
        .filter(w => w.issuedAt >= startOfMonth)
        .reduce((sum, w) => sum + (w.repairCost || 0), 0);

    // 4. Job Distribution from Backend
    const jobStatsRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/stats/jobs?shopId=${shop.id}`);
    const jobStats = jobStatsRes.ok ? await jobStatsRes.json() : { received: 0, inProgress: 0, ready: 0, delivered: 0 };

    return { 
      total,
      active,
      revenue: revenueAgg._sum.repairCost || 0,
      monthlyRevenue,
      weeklyChart,
      monthlyChart,
      jobChart,
      jobDistribution: [
          { label: 'Received', value: jobStats.received, color: '#3b82f6' },
          { label: 'In Progress', value: jobStats.inProgress, color: '#eab308' },
          { label: 'Ready', value: jobStats.ready, color: '#22c55e' },
          { label: 'Delivered', value: jobStats.delivered, color: '#64748b' }
      ],
      shopName: shop.shopName,
      subscription: shop.subscriptionStatus,
      isVerified: shop.isVerified,
      hasAccessPin: !!shop.accessPin
    };
}

export async function verifyAccessPin(pin: string) {
  const shop = await getCurrentShop();
  if (!shop.accessPin) return { success: false, error: "PIN not set" };

  // In a real app, hash this! But for this specific feature request (simple hide), direct comparison is acceptable but hashing is better.
  // For now simple comparison as we didn't add bcrypt.
  if (shop.accessPin === pin) {
    return { success: true };
  }
  return { success: false, error: "Incorrect PIN" };
}

export async function setAccessPin(pin: string) {
  const shop = await getCurrentShop();
  if (shop.accessPin) return { success: false, error: "PIN already set" };

  await db.shop.update({
    where: { id: shop.id },
    data: { accessPin: pin }
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function changeAccessPin(oldPin: string, newPin: string) {
  const shop = await getCurrentShop();

  if (!shop.accessPin) {
    return { success: false, error: "No PIN is currently set. Please set one first." };
  }

  if (shop.accessPin !== oldPin) {
    return { success: false, error: "Incorrect Old PIN" };
  }

  // In real app, enforce complexity policies here
  if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
    return { success: false, error: "PIN must be 4 digits" };
  }

  await db.shop.update({
    where: { id: shop.id },
    data: { accessPin: newPin }
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getShopDetails() {
  const shop = await getCurrentShop();

  // Self-healing: If Active but no date, give 30 days
  if (shop.subscriptionStatus === 'ACTIVE' && !shop.subscriptionEnds) {
    const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.shop.update({
      where: { id: shop.id },
      data: { subscriptionEnds: newExpiry }
    });
    shop.subscriptionEnds = newExpiry;
  }

  return shop;
}

import Razorpay from 'razorpay';

export async function createSubscriptionOrder() {
  const shop = await getCurrentShop();

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const order = await razorpay.orders.create({
      amount: 39900, // amount in paisa (399 * 100)
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        shopId: shop.id,
        phone: shop.phone
      }
    });

    return { success: true, orderId: order.id, amount: order.amount, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID };
  } catch (error) {
    console.error("RAZORPAY ORDER ERROR:", error);
    throw error;
  }
}

export async function verifySubscriptionPayment(paymentId: string, orderId: string, signature: string) {
  const shop = await getCurrentShop();

  // Verify Signature on server side
  // @ts-ignore
  const { validatePaymentVerification } = await import('razorpay/dist/utils/razorpay-utils');
  const isValid = validatePaymentVerification(
    { "order_id": orderId, "payment_id": paymentId },
    signature,
    process.env.RAZORPAY_KEY_SECRET!
  );

  if (!isValid) {
    throw new Error("Payment verification failed");
  }

  // Update Subscription in DB
  const newExpiry = new Date();
  // If already active and not expired, add to existing expiry
  if (shop.subscriptionEnds && shop.subscriptionEnds > new Date()) {
    newExpiry.setTime(shop.subscriptionEnds.getTime());
  }
  newExpiry.setDate(newExpiry.getDate() + 30); // Add 30 days

  await db.shop.update({
    where: { id: shop.id },
    data: {
      subscriptionStatus: "ACTIVE",
      subscriptionEnds: newExpiry,
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/subscription");
  return { success: true };
}

export async function updateShopDetails(formData: FormData) {
  const shop = await getCurrentShop();

  const shopName = formData.get("shopName") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const ownerName = formData.get("ownerName") as string;
  const phone = formData.get("phone") as string;

  if (!shopName || shopName.length < 3) {
    throw new Error("Shop Name must be at least 3 characters");
  }

  await db.shop.update({
    where: { id: shop.id },
    data: {
      shopName,
      address,
      city,
      ownerName,
      phone
    }
  });

  revalidatePath("/dashboard");
  return { success: true };
}

// --- ADMIN ACTIONS ---

export async function getAllJobSheets() {
  const admin = await getCurrentShop();
  if (admin.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const jobs = await db.jobSheet.findMany({
    include: {
      shop: {
        select: {
          shopName: true,
          ownerName: true,
          phone: true,
          city: true
        }
      }
    },
    orderBy: {
      receivedAt: 'desc'
    }
  });

  return jobs;
}

export async function getAdminStats() {
  const shop = await getCurrentShop();
  if (shop.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const totalShops = await db.shop.count();
  const activeSubs = await db.shop.count({ where: { subscriptionStatus: "ACTIVE" } });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const warrantiesToday = await db.warranty.count({
    where: {
      issuedAt: {
        gte: today
      }
    }
  });

  // Calculate estimated revenue (assuming 399 per active sub for now)
  const revenue = activeSubs * 399;

  return {
    totalShops,
    activeSubs,
    warrantiesToday,
    revenue
  };
}

export async function updateWarrantyNote(warrantyId: string, note: string) {
  const shop = await getCurrentShop();

  // Verify warranty belongs to this shop
  const warranty = await db.warranty.findUnique({
    where: { id: warrantyId },
    select: { shopId: true }
  });

  if (!warranty || warranty.shopId !== shop.id) {
    throw new Error("Warranty not found or access denied");
  }

  await db.warranty.update({
    where: { id: warrantyId },
    data: { privateNote: note }
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/warranties/${warrantyId}`); // In case we are on detail page
  return { success: true };
}

export async function getAllShops() {
  const shop = await getCurrentShop() as { role: string; id: string };
  if (shop.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const shops = await db.shop.findMany({
    include: {
      _count: {
        select: { warranties: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Calculate flags (simple logic: > 50 warranties active = flagged for check)
  return shops.map(shop => ({
    ...shop,
    warrantyCount: shop._count.warranties,
    isFlagged: shop._count.warranties > 50 // Simple threshold for abuse detection
  }));
}

export async function toggleShopStatus(shopId: string, currentStatus: boolean) {
  const shop = await getCurrentShop();
  if ((shop as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Toggle verification status (acting as Block/Unblock for now)
  await db.shop.update({
    where: { id: shopId },
    data: { isVerified: !currentStatus }
  });
  revalidatePath("/admin");
}

export async function deleteShop(shopId: string) {
  const shop = await getCurrentShop();
  if ((shop as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Manually cascade delete warranties first since schema doesn't have onDelete: Cascade
  await db.warranty.deleteMany({
    where: { shopId: shopId }
  });

  await db.shop.delete({
    where: { id: shopId }
  });

  revalidatePath("/admin");
}
export async function updateWarrantyStatus(warrantyId: string, newStatus: string) {
  const shop = await getCurrentShop(); // Ensure authorized

  await db.warranty.update({
    where: {
      id: warrantyId,
      shopId: shop.id // Security: ensure it belongs to this shop
    },
    data: { status: newStatus as "ACTIVE" | "EXPIRED" | "CLAIMED" | "VOID" }
  });

  revalidatePath("/dashboard");
}

export async function updateJobStatus(jobId: string, newStatus: string) {
  // No shop needed for status update as it is proxied to the backend by the ID.
  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/jobs/${jobId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });

  if (!response.ok) {
    throw new Error("Failed to update status on backend");
  }

  revalidatePath("/dashboard");
}

export async function getShopDetailsForAdmin(shopId: string) {
  const admin = await getCurrentShop() as { role: string; id: string };
  if (admin.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const shop = await db.shop.findUnique({
    where: { id: shopId },
    include: {
      warranties: {
        orderBy: { issuedAt: "desc" },
        take: 10 // Recent 10
      },
      _count: {
        select: { warranties: true }
      }
    }
  });

  if (!shop) throw new Error("Shop not found");

  // Calculate detailed stats
  const totalWarranties = shop._count.warranties;
  const activeWarranties = await db.warranty.count({
    where: { shopId: shopId, status: "ACTIVE" }
  });
  const expiredWarranties = await db.warranty.count({
    where: { shopId: shopId, status: "EXPIRED" }
  });

  // Mock Revenue Calculation (Assuming 1 subscription = 399)
  // In real app, you'd query a Payment/Invoice table
  const estimatedRevenue = shop.subscriptionStatus === 'ACTIVE' ? 399 : 0;

  return {
    ...shop,
    stats: {
      totalWarranties,
      activeWarranties,
      expiredWarranties,
      estimatedRevenue
    }
  };
}

export async function createJobSheet(formData: FormData) {
  const shop = await getCurrentShop();

  const customerName = formData.get("customerName") as string;
  const customerPhone = formData.get("customerPhone") as string;
  const customerAddress = formData.get("customerAddress") as string;

  // Use shop's pre-configured category so owner doesn't have to select it every time
  const category = shop.category || "GENERAL";
  let deviceType = formData.get("deviceType") as string;
  const deviceModel = formData.get("deviceModel") as string;
  const problemDesc = formData.get("problemDesc") as string;
  const accessories = formData.get("accessories") as string;

  const estimatedCost = parseFloat(formData.get("estimatedCost") as string) || 0;
  const advanceAmount = parseFloat(formData.get("advanceAmount") as string) || 0;

  let technicalDetails = null;

  if (category === 'MOTOR') {
    deviceType = deviceType || 'Electric Motor'; // Use form value or fallback
    technicalDetails = {
      motor: {
        power: formData.get("motor.power") as string,
        power_unit: formData.get("motor.power_unit") as string,
        phase: formData.get("motor.phase") as string,
        starter_length: formData.get("motor.starter_length") as string,
        starter_diameter: formData.get("motor.starter_diameter") as string,
        speed: formData.get("motor.speed") as string,
        capacitor: formData.get("motor.capacitor") as string,
        current: formData.get("motor.current") as string,
      }
    };
  }

  // Date handling
  const receivedAtStr = formData.get("receivedAt") as string;
  const expectedAtStr = formData.get("expectedAt") as string;

  const receivedAt = receivedAtStr ? new Date(receivedAtStr) : new Date();
  const expectedAt = expectedAtStr ? new Date(expectedAtStr) : null;

  // Use the new Backend API
  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shopId: shop.id,
      customerName,
      customerPhone,
      customerAddress,
      category,
      deviceType,
      deviceModel,
      problemDesc,
      technicalDetails,
      receivedAt,
      expectedAt,
      estimatedCost,
      advanceAmount
    })
  });

  if (!response.ok) {
    throw new Error("Failed to create job on backend");
  }

  const newJob = await response.json();

  // --- Simulate WhatsApp Sending ---
  console.log(`\n=== 🟢 WHATSAPP MSG to ${customerPhone} ===`);
  console.log(`Hello ${customerName},`);
  console.log(`Your repair job for ${deviceType} (${deviceModel}) has been created at ${shop.shopName}.`);
  console.log(`Job ID: ${newJob.jobId}`);
  console.log(`Issue: ${problemDesc}`);
  console.log(`Est. Cost: ₹${estimatedCost}`);
  console.log(`We will notify you when it is ready!`);
  console.log(`==========================================\n`);

  revalidatePath("/dashboard");
  return { success: true, jobId: newJob.jobId };
}

export async function getJobSheets() {
  const shop = await getCurrentShop();
  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/jobs?shopId=${shop.id}`);
  if (!response.ok) return [];
  return await response.json();
}

export async function getAdminJobSheets() {
  const shop = await getCurrentShop();
  if ((shop as { role: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/jobs`);
  if (!response.ok) return [];
  return await response.json();
}

export async function deleteJobSheet(jobId: string) {
  // No shop needed for deletion as it is proxied to the backend by the ID.
  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/jobs/${jobId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error("Failed to delete job from backend");
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateJobSheetDetails(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    if (!id) throw new Error("Job ID focus required");

    const customerName = formData.get("customerName") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const customerAddress = formData.get("customerAddress") as string;

    const category = (formData.get("category") as string) || "GENERAL";
    const deviceType = formData.get("deviceType") as string;
    const deviceModel = formData.get("deviceModel") as string;
    const problemDesc = formData.get("problemDesc") as string;
    const accessories = formData.get("accessories") as string;

    const status = formData.get("status") as string;

    const estimatedCost = parseFloat(formData.get("estimatedCost") as string) || 0;
    let advanceAmount = parseFloat(formData.get("advanceAmount") as string) || 0;

    // If delivered, mark as fully paid
    if (status === "DELIVERED") {
      advanceAmount = estimatedCost;
    }

    const expectedAtStr = formData.get("expectedAt") as string;
    const expectedAt = expectedAtStr ? new Date(expectedAtStr) : null;

    let technicalDetails = null;
    if (category === 'MOTOR') {
      const coilDetailsStr = formData.get("motor.coilDetails") as string;
      const partsReplacedStr = formData.get("motor.partsReplaced") as string;

      let coilDetails = null;
      let partsReplaced = [];

      try {
        coilDetails = coilDetailsStr ? JSON.parse(coilDetailsStr) : null;
      } catch (e) {
        console.error("Failed to parse coilDetails", e);
      }

      try {
        partsReplaced = partsReplacedStr ? JSON.parse(partsReplacedStr) : [];
      } catch (e) {
        console.error("Failed to parse partsReplaced", e);
      }

      technicalDetails = {
        motor: {
          power: formData.get("motor.power") as string,
          power_unit: formData.get("motor.power_unit") as string,
          phase: formData.get("motor.phase") as string,
          starter_length: formData.get("motor.starter_length") as string,
          starter_diameter: formData.get("motor.starter_diameter") as string,
          speed: formData.get("motor.speed") as string,
          capacitor: formData.get("motor.capacitor") as string,
          current: formData.get("motor.current") as string,
          coilDetails: coilDetails,
          partsReplaced: partsReplaced,
          remarks: formData.get("motor.remarks") as string,
          warrantyInfo: formData.get("motor.warrantyInfo") as string
        }
      };
    }

    // --- DIRECT DB UPDATE FOR RELIABILITY ---
    await db.jobSheet.update({
      where: { id },
      data: {
        customerName,
        customerPhone,
        customerAddress,
        category,
        deviceType,
        ...(status && { status: status as any }),
        deviceModel,
        problemDesc,
        accessories,
        technicalDetails: technicalDetails as any,
        estimatedCost,
        advanceAmount,
        expectedAt
      }
    });



    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Update error:", error);
    throw new Error(error.message || "Failed to update job");
  }
}

export async function addPayment(jobId: string, amount: number, date: Date, note?: string) {
  const shop = await getCurrentShop(); // Ensure authorized

  // 1. Create Payment
  const payment = await db.payment.create({
    data: {
      jobId,
      amount,
      date,
      note: note || ''
    }
  });

  // 2. Update JobSheet total
  const job = await db.jobSheet.findUnique({
    where: { id: jobId },
    include: { payments: true }
  });

  if (job) {
    const totalPaid = job.payments.reduce((sum, p) => sum + p.amount, 0);
    await db.jobSheet.update({
      where: { id: jobId },
      data: { advanceAmount: totalPaid }
    });
  }

  revalidatePath("/dashboard");
  return { success: true, payment };
}

export async function deletePayment(paymentId: string, jobId: string) {
  const shop = await getCurrentShop(); // Ensure authorized

  // 1. Delete Payment
  await db.payment.delete({
    where: { id: paymentId }
  });

  // 2. Update JobSheet total
  const job = await db.jobSheet.findUnique({
    where: { id: jobId },
    include: { payments: true }
  });

  if (job) {
    const totalPaid = job.payments.reduce((sum, p) => sum + p.amount, 0);
    await db.jobSheet.update({
      where: { id: jobId },
      data: { advanceAmount: totalPaid }
    });
  }

  revalidatePath("/dashboard");
  return { success: true };
}
