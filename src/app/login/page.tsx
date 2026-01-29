"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { sendOtp, verifyOtp } from "@/lib/auth-actions";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true);
    setError(null);
    
    try {
        await sendOtp(phone);
        setStep("otp");
    } catch (err) {
        setError("Failed to send OTP. Try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
        const res = await verifyOtp(phone, otp);
        if (res.success) {
            if (res.role === "ADMIN") {
                router.push("/admin");
            } else if (res.shopName === "New Shop Info Required") {
                router.push("/dashboard/settings");
            } else {
                router.push("/dashboard");
            }
        } else {
            setError(res.error || "Invalid OTP");
        }
    } catch (err) {
        setError("Something went wrong");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8 animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl mb-6 hover:opacity-80 transition-opacity">
            <ShieldCheck className="h-6 w-6" />
            <span>FixSure</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Partner Login</h1>
          <p className="text-muted-foreground text-sm">
            Enter your mobile number to access your shop dashboard.
          </p>
        </div>

        {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium text-center animate-pulse">
                {error}
            </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  className="flex-1 h-10 px-3 rounded-r-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className={cn(
                "w-full h-10 rounded-md bg-primary text-primary-foreground font-medium transition-all flex items-center justify-center gap-2",
                "hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Get OTP <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4 animate-fade-in">
             <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium">One Time Password</label>
              <input
                id="otp"
                type="text"
                placeholder="123456"
                className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-center tracking-widest text-lg"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                OTP sent to +91 {phone} <button type="button" onClick={() => setStep("phone")} className="text-primary hover:underline">Change</button>
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className={cn(
                "w-full h-10 rounded-md bg-primary text-primary-foreground font-medium transition-all flex items-center justify-center gap-2",
                "hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
               {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Login"}
            </button>
          </form>
        )}
        
        <div className="mt-8 text-center">
             <p className="text-xs text-muted-foreground">
               New Shop? Just enter your mobile number to register instantly.
             </p>
        </div>
      </div>
    </div>
  );
}
