"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Loader2, Mail, Lock, Phone, Store, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

import { loginWithEmail, signup, googleLogin } from "@/lib/auth-actions";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");

  // For verification errors or status messages
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const modeParam = params.get("mode");
    if (emailParam) setEmail(emailParam);
    if (modeParam === "signup") setMode("signup");
  }, []);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!email) errors.email = "Email is required";
    else if (!validateEmail(email)) errors.email = "Invalid email address";
    
    if (!password) errors.password = "Password is required";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters";

    if (mode === "signup") {
      if (!phone) errors.phone = "Mobile number is required";
      else if (phone.length !== 10) errors.phone = "Enter a valid 10-digit number";
      
      if (!shopName) errors.shopName = "Shop name is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateGoogleSignup = () => {
    const errors: Record<string, string> = {};
    
    if (!phone) errors.phone = "Mobile number is required";
    else if (phone.length !== 10) errors.phone = "Enter a valid 10-digit number";
    
    if (!shopName) errors.shopName = "Shop name is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        if (res.role === "ADMIN") window.location.href = "/admin";
        else window.location.href = "/dashboard";
        return; // Keep loader active during redirect
      } else {
        setError(res.error || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await signup({ email, password, phone, shopName });
      if (res.success) {
        if (res.shopName === "New Shop Info Required") {
            window.location.href = "/dashboard/settings";
        } else {
            window.location.href = "/dashboard";
        }
        return; // Keep loader active during redirect
      } else {
        setError(res.error || "Signup failed");
      }
    } catch (err) {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (mode === "signup") {
      if (!validateGoogleSignup()) return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const res = await googleLogin({
        email: user.email!,
        name: user.displayName || "User",
        googleId: user.uid,
        phone: mode === "signup" ? phone : undefined,
        shopName: mode === "signup" ? shopName : undefined,
      });

      if (res.success) {
        window.location.href = "/dashboard";
        return; // Keep loader active
      } else if (res.needsPhone) {
        setMode("signup");
        setError("Account not found. Please fill in your Phone and Shop Name above, then click Google Login again to create your account.");
      } else {
        setError(res.error || "Google login failed");
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please try again.");
      } else if (err.code === "auth/unauthorized-domain") {
        const domain = window.location.hostname;
        setError(`Domain "${domain}" is not authorized in Firebase Console. Add it under Authentication > Settings > Authorized domains.`);
      } else {
        setError(err.message || "Google login failed. Check your Firebase config.");
      }
    }
    setLoading(false);
  };


  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF9] relative flex items-center justify-center p-4">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-[120px] -z-0"></div>
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -z-0"></div>
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] -z-0" />

      <div className="w-full max-w-md z-10 py-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white/50 p-6 md:p-8 animate-in fade-in zoom-in duration-700">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-[#FF6442] font-bold text-2xl mb-4 group transition-all">
              <div className="p-2 bg-[#FF6442]/10 rounded-xl group-hover:bg-[#FF6442]/20 transition-colors">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span className="text-slate-900">FixSure</span>
            </Link>
            
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-1">
              {mode === "login" ? "Welcome Back" : "Partner Signup"}
            </h1>
            <p className="text-slate-500 text-[14px] leading-snug px-4 font-medium mb-2">
              {mode === "login" 
                ? "Access your dashboard to manage warranties" 
                : "Start issuing digital warranties in 60 seconds"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-3">
              {mode === "signup" && (
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Shop Name</label>
                      <div className="relative group">
                        <Store className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${fieldErrors.shopName ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`} />
                        <input
                            type="text"
                            placeholder="A-1 Mobile Repair Hub"
                            className={`w-full h-11 pl-11 pr-4 rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:ring-4 outline-none transition-all font-semibold text-sm ${fieldErrors.shopName ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary/10 focus:border-primary'}`}
                            value={shopName}
                            onChange={(e) => {
                              setShopName(e.target.value);
                              clearFieldError('shopName');
                            }}
                        />
                      </div>
                      {fieldErrors.shopName && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.shopName}</p>}
                  </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${fieldErrors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className={`w-full h-11 pl-11 pr-4 rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:ring-4 outline-none transition-all font-semibold text-sm ${fieldErrors.email ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary/10 focus:border-primary'}`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError('email');
                    }}
                  />
                </div>
                {fieldErrors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.email}</p>}
              </div>

              {mode === "signup" && (
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                      <div className="relative group">
                      <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${fieldErrors.phone ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`} />
                      <input
                          type="tel"
                          placeholder="9876543210"
                          className={`w-full h-11 pl-11 pr-4 rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:ring-4 outline-none transition-all font-semibold text-sm ${fieldErrors.phone ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary/10 focus:border-primary'}`}
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value.replace(/\D/g, ''));
                            clearFieldError('phone');
                          }}
                          maxLength={10}
                      />
                      </div>
                      {fieldErrors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.phone}</p>}
                  </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  {mode === "login" && (
                      <button type="button" className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">Forgot?</button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${fieldErrors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={`w-full h-11 pl-11 pr-4 rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:ring-4 outline-none transition-all font-semibold text-sm ${fieldErrors.password ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary/10 focus:border-primary'}`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError('password');
                    }}
                  />
                </div>
                {fieldErrors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-2 rounded-xl bg-primary text-white font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <span>{mode === "login" ? "Sign In Now" : "Create Account"}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-widest">
                <span className="bg-white px-3 text-slate-400">Or connect with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-bold text-slate-700 shadow-sm group text-sm"
            >
              <div className="bg-white p-1 rounded-lg border border-slate-100 shadow-sm">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <span>Sign in with Google</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-xs font-semibold">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-primary font-bold hover:underline underline-offset-4 decoration-2 transition-all ml-1"
              >
                {mode === "login" ? "Create One Free" : "Sign In Here"}
              </button>
            </p>
          </div>
        </div>
        
        <p className="mt-3 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-[-12px]">
          Secure & Verified. © 2026 FixSure Digital.
        </p>
      </div>
    </div>
  );
}
