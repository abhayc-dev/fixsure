"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, CreditCard, Loader2, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { createSubscriptionOrder, verifySubscriptionPayment } from "@/lib/actions";
import { useRouter } from "next/navigation";
import Script from "next/script";

// Define a safe type for the Shop object that matches what comes from the server
// We use 'any' for the date to handle string serialization if it happens, 
// but ideally we cast it properly.
type ShopData = {
    shopName: string;
    subscriptionStatus: string;
    subscriptionEnds: Date | string | null;
    phone?: string;
}

export default function SubscriptionPage({ shop }: { shop: ShopData }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Create Order
            const { orderId, amount, keyId } = await createSubscriptionOrder();

            // 2. Initialize Razorpay options
            const options = {
                key: keyId,
                amount: amount,
                currency: "INR",
                name: "FixSure Business",
                description: "Monthly Pro Subscription",
                image: "https://fixsure.in/logo.png", // Replace with your logo if hosted, or leave default
                order_id: orderId,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    try {
                        await verifySubscriptionPayment(
                            response.razorpay_payment_id,
                            response.razorpay_order_id,
                            response.razorpay_signature
                        );
                        alert("Payment Successful! Plan activated.");
                        router.refresh();
                    } catch (err: any) {
                        alert("Payment Verification Failed: " + err.message);
                    }
                },
                prefill: {
                    name: shop.shopName,
                    contact: shop.phone
                },
                theme: {
                    color: "#4f46e5"
                }
            };

            // 4. Open Razorpay
            const rzp1 = new (window as any).Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                alert(response.error.description);
            });
            rzp1.open();

        } catch (error) {
            console.error("Payment Error:", error);
            alert("Something went wrong initializing payment.");
        } finally {
            setLoading(false);
        }
    };

    const calculateDaysLeft = () => {
        if (!shop.subscriptionEnds) return 0;
        const end = new Date(shop.subscriptionEnds);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysLeft = calculateDaysLeft();

    const expiryDate = shop.subscriptionEnds
        ? new Date(shop.subscriptionEnds).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        })
        : "No active plan";

    const isExpired = shop.subscriptionStatus === "EXPIRED" || (shop.subscriptionEnds && new Date(shop.subscriptionEnds) < new Date());

    return (
        <div className="min-h-screen bg-muted/20 p-4 md:p-8 flex items-center justify-center">
            <div className="max-w-2xl w-full space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/settings" className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft className="h-6 w-6 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Subscription Plan</h1>
                        <p className="text-muted-foreground">Manage your shop billing</p>
                    </div>
                </div>

                {/* Current Status Card */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground tracking-wide mb-1">Current Status</p>
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "inline-flex w-3 h-3 rounded-full",
                                shop.subscriptionStatus === 'ACTIVE' ? "bg-green-500" : "bg-red-500"
                            )} />
                            <span className="text-2xl font-bold">{shop.subscriptionStatus}</span>
                        </div>
                        {shop.subscriptionStatus === 'ACTIVE' && shop.subscriptionEnds && (
                            <div className={cn("mt-2 inline-flex px-2 py-1 rounded text-xs font-bold", daysLeft <= 5 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700")}>
                                {daysLeft} Days Left
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                            {shop.subscriptionStatus === 'ACTIVE' ? "Valid till: " : "Expired on: "}
                            <span className="font-mono font-medium text-foreground">{expiryDate}</span>
                        </p>
                    </div>
                    {shop.subscriptionStatus === 'ACTIVE' && (
                        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium border border-green-100 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Fully Protected
                        </div>
                    )}
                </div>

                {/* Plan Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Standard Plan */}
                    <div className={`relative bg-card rounded-2xl border-2 p-6 shadow-lg transition-all ${isExpired ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
                        {isExpired && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                                Recommended
                            </div>
                        )}

                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold">Monthly Pro</h3>
                                <p className="text-sm text-muted-foreground">For growing shops</p>
                            </div>
                            <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                        </div>

                        <div className="mb-6">
                            <span className="text-3xl font-extrabold">₹399</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>

                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" /> Unlimited Warranties
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" /> WhatsApp SMS Integration
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" /> Verified Shop Badge
                            </li>
                        </ul>

                        <button
                            onClick={handlePayment}
                            disabled={loading || shop.subscriptionStatus === 'ACTIVE'}
                            className={cn(
                                "w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                                loading ? "bg-muted text-muted-foreground" : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25"
                            )}
                        >
                            {loading ? (
                                <>Processing Payment...</>
                            ) : shop.subscriptionStatus === 'ACTIVE' ? (
                                "Plan Active"
                            ) : (
                                <>Pay ₹399 via UPI <CreditCard className="h-4 w-4" /></>
                            )}
                        </button>
                        <p className="text-xs text-center text-muted-foreground mt-3">Secured by Razorpay</p>
                    </div>

                    {/* Support Card */}
                    <div className="bg-secondary/30 rounded-2xl border border-border p-6 flex flex-col justify-center text-center">
                        <div className="w-12 h-12 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-bold mb-2">Need Help?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Issue with payment or need a custom enterprise plan for multiple branches?
                        </p>
                        <button className="text-primary font-medium hover:underline">Contact Support</button>
                    </div>
                </div>
            </div>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </div>
    );
}
