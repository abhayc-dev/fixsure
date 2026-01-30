"use client";

import { useState } from "react";
import { ArrowRight, Mail, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { checkEmailExists } from "@/lib/auth-actions";

export default function HomeHeroForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGetStarted = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      const { exists } = await checkEmailExists(email);
      const mode = exists ? "login" : "signup";
      router.push(`/login?email=${encodeURIComponent(email)}&mode=${mode}`);
    } catch (error) {
      // Fallback to signup if check fails
      router.push(`/login?email=${encodeURIComponent(email)}&mode=signup`);
    } finally {
      setLoading(false);
    }
  };

  return (
  <form
    onSubmit={handleGetStarted}
    className="flex flex-col gap-4 w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150"
  >
    <div className="flex flex-col sm:flex-row items-center gap-3 p-2 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-[0_20px_50px_rgba(0,9,1,0.05)]">
      
      {/* EMAIL INPUT */}
      <div className="flex items-center flex-grow w-full sm:w-auto bg-slate-100/80 rounded-[1.5rem] border border-slate-200/50 transition-all focus-within:bg-white focus-within:shadow-inner group">
        <div className="pl-6 text-slate-400 group-focus-within:text-primary transition-colors">
          <Mail className="w-5 h-5" />
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your work email"
          className="w-full px-4 py-5 text-[15px] font-semibold outline-none text-slate-800 placeholder:text-slate-500 bg-transparent"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto bg-primary hover:bg-[#ff5530] text-white font-bold px-8 py-5 rounded-[1.5rem] shadow-xl shadow-orange-100  hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 group whitespace-nowrap disabled:opacity-70 disabled:translate-y-0"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </div>

    {/* FOOTER */}
    <div className="flex items-center gap-2 px-4">
      <div className="p-1 bg-orange-100 rounded-md">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
      </div>
      <p className="text-slate-500 text-[13px] font-semibold tracking-tight">
        Unlock your 14-day free trial.
      </p>
    </div>
  </form>
  );
}
