"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Loader2, X, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { sendOtp, verifyOtp } from "@/lib/auth-actions";

export default function HomeHeroForm() {
  const [phone, setPhone] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [step, setStep] = useState<"INPUT" | "OTP">("OTP"); // Default to OTP because main page is step 1
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const validatePhone = (p: string) => {
     const clean = p.replace(/\D/g, "");
     return clean.length === 10;
  };

  // Called from Main Landing Page
  const handleGetStarted = async () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (!validatePhone(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await sendOtp(cleanPhone);
      if (res && res.success) {
        setShowOtpModal(true);
        setStep("OTP");
        setTimer(15);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Called from Modal "Edit" -> "Get OTP"
  const handleGetOtpInModal = async () => {
     const cleanPhone = phone.replace(/\D/g, "");
     if (!validatePhone(phone)) {
       setError("Please enter a valid 10-digit phone number");
       return;
     } 
     setError("");
     setLoading(true);
     try {
       const res = await sendOtp(cleanPhone);
       if (res && res.success) {
         setStep("OTP");
         setTimer(15);
       } else {
         setError("Failed to send OTP. Please try again.");
       }
     } catch(e) {
        setError("Something went wrong");
     } finally {
        setLoading(false);
     }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError("Please enter a valid OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await verifyOtp(phone, otp);
      if (res.success) {
        if (res.role === "ADMIN") router.push("/admin");
        else router.push("/dashboard");
      } else {
        setError(res.error || "Invalid OTP");
      }
    } catch (e) {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError("");
    try {
        await sendOtp(phone);
        setTimer(15);
        setError("OTP Resent!");
    } catch(e) {
        setError("Failed to resend OTP");
    }
    setLoading(false);
  };

  const handleEditClick = () => {
      setStep("INPUT");
      setError("");
  };

  // Ensure we are client-side for portal
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Modal Content
  const modalContent = showOtpModal && mounted ? (
    createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 isolate">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowOtpModal(false)}
        />
        
        {/* Modal Card */}
        <div className="bg-white rounded-2xl w-full max-w-[400px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 z-10 flex flex-col">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-8 flex flex-col items-center text-center">
              
              {/* Logo / Header */}
              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="bg-[#FFF7F4] p-3 rounded-xl">
                   <ShieldCheck className="w-8 h-8 text-[#FF6442]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome to FixSure</h2>
              </div>

              {step === "INPUT" ? (
                 <>
                    {/* Modal Phone Input View */}
                    <div className="w-full text-left mb-6">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Enter phone number</label>
                        <div className="flex items-center w-full px-4 py-3 bg-white border border-gray-300 focus-within:border-[#FF6442] focus-within:ring-4 focus-within:ring-[#FF6442]/5 rounded-lg text-gray-900 font-medium transition-all">
                                <span className="text-gray-500 mr-2 border-r border-gray-200 pr-2">+91</span>
                                <input 
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setPhone(val);
                                    }}
                                    placeholder="98765 43210"
                                    className="w-full outline-none text-black placeholder:text-gray-400"
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && handleGetOtpInModal()}
                                />
                        </div>
                    </div>

                    {error && <div className="w-full bg-red-50 text-red-600 text-sm py-2 px-3 rounded-lg mb-4 text-center font-medium border border-red-100">{error}</div>}

                    <button 
                        onClick={handleGetOtpInModal}
                        disabled={loading}
                        className="w-full bg-[#FF6442] text-white font-bold text-lg py-3.5 rounded-xl hover:bg-[#E55B3C] transition-all shadow-lg shadow-[#FF6442]/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mb-6 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get OTP"}
                    </button>
                 </>
              ) : (
                 <>
                    {/* Modal OTP Input View */}
                    <div className="w-full text-left mb-4">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Enter phone number</label>
                        <div className="relative group">
                            <div className="flex items-center w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                                <span className="text-gray-500 mr-2">+91</span>
                                {phone}
                            </div>
                            <button 
                                onClick={handleEditClick}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FF6442] text-sm font-semibold hover:bg-[#FFF7F4] px-3 py-1.5 rounded-md transition-colors"
                            >
                                Edit
                            </button>
                        </div>
                    </div>

                    <div className="w-full text-left mb-6">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Enter OTP</label>
                        <input 
                            type="text" 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF6442] focus:ring-4 focus:ring-[#FF6442]/5 transition-all font-medium text-lg text-black placeholder:text-gray-400"
                            autoFocus
                            maxLength={6}
                            onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                        />
                        <div className="mt-2 flex justify-between items-center text-sm">
                            {timer > 0 ? (
                                <span className="text-gray-500">
                                    Resend OTP in <span className="font-bold text-gray-900">{timer}s</span>
                                </span>
                            ) : (
                                <button 
                                    onClick={handleResend}
                                    className="text-[#FF6442] font-semibold hover:underline decoration-2 underline-offset-2"
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>
                    </div>

                    {error && <div className="w-full bg-red-50 text-red-600 text-sm py-2 px-3 rounded-lg mb-4 text-center font-medium border border-red-100">{error}</div>}

                    <button 
                        onClick={handleVerifyOtp}
                        disabled={loading || otp.length < 4}
                        className="w-full bg-[#FF6442] text-white font-bold text-lg py-3.5 rounded-xl hover:bg-[#E55B3C] transition-all shadow-lg shadow-[#FF6442]/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mb-6 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
                    </button>
                 </>
              )}

              {/* Footer Terms */}
              <p className="text-[11px] text-gray-400 leading-relaxed max-w-xs mx-auto">
                By proceeding, you agree to our <a href="#" className="underline decoration-gray-300 hover:text-gray-600">Terms of Use</a> and <a href="#" className="underline decoration-gray-300 hover:text-gray-600">Privacy Policy</a>
              </p>

            </div>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      {/* Home Page Input Form */}
      <div className="flex flex-col gap-2 w-full max-w-lg">
        <div className="flex flex-col sm:flex-row gap-3">
            <div className={`flex-1 bg-white rounded-lg border ${error && !showOtpModal ? 'border-red-500' : 'border-gray-300'} focus-within:border-[#FF6442] focus-within:ring-4 focus-within:ring-[#FF6442]/5 transition-all shadow-sm flex items-center overflow-hidden`}>
                <div className="bg-gray-50 px-3 py-3.5 border-r border-gray-200 text-gray-500 font-bold text-sm">+91</div>
                <input 
                type="tel" 
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(val);
                }}
                placeholder="Enter shop phone number" 
                className="w-full px-4 py-3.5 outline-none text-foreground placeholder:text-gray-400 font-medium text-black"
                onKeyDown={(e) => e.key === "Enter" && handleGetStarted()}
                />
            </div>
            <button 
                onClick={handleGetStarted}
                disabled={loading}
                className="bg-[#FF6442] text-[16px] text-white font-bold px-8 py-3.5 rounded-lg hover:bg-[#E55B3C] transition-all shadow-lg shadow-[#FF6442]/20 whitespace-nowrap flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Get Started"} 
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
        </div>
        {error && !showOtpModal && <p className="text-red-500 text-sm px-1">{error}</p>}
      </div>

      {modalContent}
    </>
  );
}
