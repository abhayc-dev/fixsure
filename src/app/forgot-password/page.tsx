
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, ShieldCheck, KeyRound } from "lucide-react";
import { requestPasswordReset } from "@/lib/reset-actions";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        // Redirect to OTP verification page with email in query param
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        setError(res.error || "Something went wrong sending the OTP.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF9] relative flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-[120px] -z-0"></div>
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -z-0"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] -z-0" />

      <div className="w-full max-w-md z-10 py-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white/50 p-6 md:p-8 animate-in fade-in zoom-in duration-500">
          
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-[#FF6442] font-bold text-2xl mb-4 group transition-all">
              <div className="p-2 bg-[#FF6442]/10 rounded-xl group-hover:bg-[#FF6442]/20 transition-colors">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span className="text-slate-900">FixSure</span>
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-1">
              Reset Password
            </h1>
            <p className="text-slate-500 text-sm">
              Enter your email to receive a secure OTP.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-semibold text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 rounded-xl bg-primary text-white font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Send OTP</span>
                </>
              )}
            </button>

            <div className="text-center mt-6">
              <Link
                href="/login"
                className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
        
        <p className="mt-6 text-center text-slate-400 text-[10px] font-bold tracking-widest">
          Secure & Verified. © 2026 FixSure Digital.
        </p>
      </div>
    </div>
  );
}
