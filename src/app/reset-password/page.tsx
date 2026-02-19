
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Lock, ShieldCheck, KeyRound } from "lucide-react";
import { verifyOtpForReset, resetPassword, requestPasswordReset } from "@/lib/reset-actions";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [step, setStep] = useState<"otp" | "password">("otp");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [expiryTimer, setExpiryTimer] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (expiryTimer > 0 && step === "otp") {
      interval = setInterval(() => {
        setExpiryTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [expiryTimer, step]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple chars
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await verifyOtpForReset(email, fullOtp);
      if (res.valid) {
        setStep("password");
      } else {
        setError("Invalid or expired OTP. Please try again.");
      }
    } catch (err) {
      setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setResendTimer(60); // 60 seconds cooldown
        setExpiryTimer(300); // Reset expiry to 5 minutes
        setError(null);
        alert("OTP resent successfully!");
      } else {
        setError(res.error || "Failed to resend OTP.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullOtp = otp.join("");
      const res = await resetPassword(email, fullOtp, password);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(res.error || "Failed to reset password.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Success!</h3>
        <p className="text-slate-600 mb-6">
          Your password has been updated.
          <br />
          Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-1">
          {step === "otp" ? "Enter OTP" : "New Password"}
        </h1>
        <p className="text-slate-500 text-sm">
          {step === "otp"
            ? `We sent a code to ${email}`
            : "Create a secure password for your account."}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {step === "otp" ? (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl font-bold rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
              />
            ))}
          </div>

          <div className="text-center">
             {expiryTimer > 0 ? (
                <p className="text-xs font-bold text-slate-500 bg-slate-100 inline-block px-3 py-1 rounded-full">
                  Code expires in {Math.floor(expiryTimer / 60)}:{(expiryTimer % 60).toString().padStart(2, '0')}
                </p>
             ) : (
                <p className="text-xs font-bold text-red-500 bg-red-50 inline-block px-3 py-1 rounded-full">
                  Code expired. Please resend.
                </p>
             )}
          </div>

          <button
            type="submit"
            disabled={loading || expiryTimer === 0}
            className="w-full h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Code"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || loading}
              className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors disabled:opacity-50"
            >
              {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 tracking-widest ml-1">New Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-semibold text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 tracking-widest ml-1">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-semibold text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Change Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF9] relative flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-[120px] -z-0"></div>
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -z-0"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] -z-0" />

      <div className="w-full max-w-md z-10 py-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white/50 p-6 md:p-8 animate-in fade-in zoom-in duration-500">
          
          <div className="text-center mb-4">
             <Link href="/" className="inline-flex items-center gap-2 text-[#FF6442] font-bold text-2xl mb-4 group transition-all">
               <div className="p-2 bg-[#FF6442]/10 rounded-xl group-hover:bg-[#FF6442]/20 transition-colors">
                 <ShieldCheck className="h-6 w-6" />
               </div>
               <span className="text-slate-900">FixSure</span>
             </Link>
          </div>

          <Suspense fallback={
             <div className="flex flex-col items-center py-12">
               <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
               <p className="text-slate-500 font-medium">Loading...</p>
             </div>
          }>
            <ResetPasswordContent />
          </Suspense>

        </div>
        
        <p className="mt-6 text-center text-slate-400 text-[10px] font-bold tracking-widest">
          Secure & Verified. © 2026 FixSure Digital.
        </p>
      </div>
    </div>
  );
}
