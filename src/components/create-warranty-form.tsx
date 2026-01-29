"use client";

import { useState } from "react";
import { Loader2, Plus, User, Smartphone, MapPin, Wrench, Calendar, Receipt, ShieldCheck, CheckCircle } from "lucide-react";
import { createWarranty } from "@/lib/actions";
import { cn } from "@/lib/utils";

export default function CreateWarrantyForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setStatus(null);
    try {
        await createWarranty(formData);
        setStatus({ type: 'success', message: "Warranty created and SMS sent successfully!" });
        // Optional: wait a moment before redirecting or clearing
        setTimeout(() => {
            onSuccess();
        }, 1500);
    } catch (e: any) {
        setStatus({ type: 'error', message: e.message || "Something went wrong" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in w-full">
        {/* Main Form Card with Integrated Header */}
        <form action={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            
            {/* Header Section inside the card */}
            <div className="flex items-start gap-4 mb-8">
                 <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                     <ShieldCheck className="h-6 w-6" />
                 </div>
                 <div>
                     <h2 className="text-xl font-bold text-slate-800">Issue New Warranty</h2>
                     <p className="text-sm text-slate-400 mt-1">
                         Generate a digital warranty card and automatically send it to the customer via SMS.
                     </p>
                 </div>
            </div>

            {status && (
                <div className={cn(
                    "p-4 mb-8 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2 border shadow-sm",
                    status.type === 'success' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                )}>
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0"/> : <ShieldCheck className="w-5 h-5 flex-shrink-0"/>}
                    {status.message}
                </div>
            )}

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            <User className="w-4 h-4 text-primary" /> 
                            Customer Name
                        </label>
                        <input 
                            name="customer"
                            required
                            placeholder="e.g. Rahul Kumar"
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            <Smartphone className="w-4 h-4 text-primary" /> 
                            Mobile Number
                        </label>
                        <input 
                            name="phone"
                            required
                            type="tel" 
                            maxLength={10} 
                            placeholder="e.g. 9876543210"
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                        <MapPin className="w-4 h-4 text-primary" /> 
                        Customer Address
                    </label>
                    <input 
                        name="address"
                        placeholder="e.g. House No. 12, Sector 4, Market Area"
                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                     <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            <Smartphone className="w-4 h-4 text-primary" /> 
                            Device Model
                        </label>
                        <input 
                            name="device"
                            required
                            placeholder="e.g. Samsung Galaxy S21"
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            <Wrench className="w-4 h-4 text-primary" /> 
                            Repair Description
                        </label>
                        <input 
                            name="issue"
                            required
                            placeholder="e.g. Screen Replacement"
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-7">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            <Receipt className="w-4 h-4 text-primary" /> 
                            Repair Cost (₹)
                        </label>
                        <input 
                           name="price"
                           type="number"
                           min="0"
                           step="10"
                           required
                           placeholder="e.g. 1500"
                           className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            <Calendar className="w-4 h-4 text-primary" /> 
                            Warranty Period
                        </label>
                        <div className="relative">
                            <select 
                                name="duration"
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm appearance-none"
                                defaultValue="30"
                            >
                                <option value="15">15 Days</option>
                                <option value="30">30 Days (Standard)</option>
                                <option value="90">3 Months</option>
                                <option value="180">6 Months</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mb-[-6px]">
                <button 
                    type="submit" 
                    disabled={loading}
                    className={cn(
                        "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all h-12 px-8 gap-2 shadow-sm w-full md:w-auto",
                        loading 
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                            : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] hover:shadow-md"
                    )}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Generate Warranty
                </button>
            </div>
        </form>
    </div>
  );
}
