"use client";

import { useState } from "react";
import { Loader2, KeyRound, ShieldCheck, CheckCircle, XCircle } from "lucide-react";
import { changeAccessPin } from "@/lib/actions";
import { cn } from "@/lib/utils";

export default function SecurityForm({ hasPin }: { hasPin: boolean }) {
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [oldPin, setOldPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPin !== confirmPin) {
            setStatus({ type: 'error', message: "New PIN and Confirm PIN do not match!" });
            return;
        }

        if (newPin.length !== 4) {
             setStatus({ type: 'error', message: "PIN must be exactly 4 digits." });
             return;
        }

        setStatus(null);
        setLoading(true);

        try {
            const res = await changeAccessPin(oldPin, newPin);
            if (res.success) {
                setStatus({ type: 'success', message: "Security PIN updated successfully!" });
                // Reset form
                setOldPin("");
                setNewPin("");
                setConfirmPin("");
            } else {
                setStatus({ type: 'error', message: res.error || "Failed to update PIN." });
            }
        } catch (error) {
            setStatus({ type: 'error', message: "Something went wrong. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    if (!hasPin) {
        return (
             <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-4">
                 <div className="bg-orange-100 p-2 rounded-full">
                     <ShieldCheck className="w-5 h-5 text-orange-600" />
                 </div>
                 <div>
                     <h3 className="font-medium text-orange-900">Security PIN Not Set</h3>
                     <p className="text-sm text-orange-700 mt-1">
                         To protect your revenue visibility, please set a PIN from the dashboard by clicking the &quot;Eye&quot; icon on the revenue card.
                     </p>
                 </div>
             </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            
            {/* Header / Info */}
            <div className="bg-orange-50/50 p-4 rounded-lg flex items-start gap-4 border border-orange-100 mb-6">
                <div className="p-2 bg-white rounded-full shadow-sm">
                   <ShieldCheck className="w-5 h-5 text-orange-600" /> 
                </div>
                <div>
                    <h3 className="text-sm font-bold text-orange-900">Security Access</h3>
                    <p className="text-xs text-orange-700 mt-1">
                        Your PIN protects sensitive revenue data. Keep it private. You can update it here at any time.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {status && (
                    <div className={cn(
                        "p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2 shadow-sm border",
                        status.type === 'success' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                    )}>
                        {status.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0"/> : <XCircle className="w-5 h-5 flex-shrink-0"/>}
                        {status.message}
                    </div>
                )}

                <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                        <KeyRound className="w-4 h-4 text-primary" /> Current PIN
                    </label>
                    <div className="relative">
                        <input
                            type="password"
                            maxLength={4}
                            inputMode="numeric"
                            value={oldPin}
                            onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))} // Numeric only
                            required
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm tracking-[0.5em] font-mono"
                            placeholder="••••"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            <ShieldCheck className="w-4 h-4 text-primary" /> New PIN
                        </label>
                        <input
                            type="password"
                            maxLength={4}
                            inputMode="numeric"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                            required
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm tracking-[0.5em] font-mono"
                            placeholder="••••"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            <CheckCircle className="w-4 h-4 text-primary" /> Confirm PIN
                        </label>
                        <input
                            type="password"
                            maxLength={4}
                            inputMode="numeric"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                            required
                            className={cn(
                                "flex h-12 w-full rounded-xl border bg-white px-4 py-3 text-sm transition-all shadow-sm tracking-[0.5em] font-mono focus-visible:outline-none focus-visible:ring-2",
                                confirmPin && newPin !== confirmPin 
                                    ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/50" 
                                    : "border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary"
                            )}
                            placeholder="••••"
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-start mb-[-5px] mt-[-2px]">
                    <button 
                        type="submit" 
                        disabled={loading || oldPin.length < 4 || newPin.length < 4}
                        className={cn(
                            "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all h-12 px-8 gap-2 shadow-sm",
                             loading || oldPin.length < 4 || newPin.length < 4
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] hover:shadow-md"
                        )}
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Update Security PIN"}
                    </button>
                </div>
            </form>
        </div>
    );
}
