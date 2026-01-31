"use client";

import { useState } from "react";
import { Loader2, Plus, Wrench, Smartphone, User, Receipt, CheckCircle, ShieldCheck } from "lucide-react";
import { createJobSheet } from "@/lib/actions";
import { cn } from "@/lib/utils";

export default function CreateJobSheetForm({ onSuccess, shopCategory }: { onSuccess: () => void, shopCategory?: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(shopCategory || "GENERAL");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setLoading(true);
    setStatus(null);
    
    try {
        await createJobSheet(formData);
        setStatus({ type: 'success', message: "Job Sheet created successfully!" });
        
        // Wait for the success message to be seen before closing
        setTimeout(() => {
            onSuccess();
        }, 1500);
    } catch (e: any) {
        setStatus({ type: 'error', message: e.message || "Something went wrong" });
        setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in w-full">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 relative overflow-hidden">
            
            {/* Professional Loading Overlay - Changed to fixed for screen-center positioning */}
            {loading && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[4px] z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center gap-5 scale-100 animate-in zoom-in-95 duration-300 max-w-[280px] w-full">
                        <div className="relative">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <div className="absolute inset-0 blur-xl bg-primary/20 -z-10 animate-pulse" />
                        </div>
                        <div className="text-center">
                            <p className="text-base font-bold text-slate-800">Processing Job Sheet</p>
                            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Please wait a moment</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Header */}
            <div className="flex items-start gap-4 mb-10">
                 <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                     <Wrench className="h-6 w-6" />
                 </div>
                 <div>
                     <h2 className="text-xl font-bold text-slate-800">New Repair Job Sheet</h2>
                     <p className="text-sm text-slate-400 mt-1">
                         Generate a professional service record for the repair job.
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

            <div className="space-y-12">
                
                {/* Section 1: Customer Details */}
                <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 pb-3">
                        <User className="w-4 h-4" /> Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Customer Name</label>
                            <input 
                                name="customerName"
                                required
                                placeholder="Full Name"
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Mobile Number</label>
                            <input 
                                name="customerPhone"
                                required
                                type="tel"
                                maxLength={10}
                                placeholder="10 Digits"
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Address (Optional)</label>
                            <input 
                                name="customerAddress"
                                placeholder="City, Area, Landmark"
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Technical Details */}
                <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 pb-3">
                        {selectedCategory === 'MOTOR' ? <Wrench className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />} 
                        Motor Details
                    </h3>

                    {!shopCategory && (
                        <div className="space-y-2 max-w-sm">
                            <label className="text-sm font-bold text-slate-700 ml-1">Service Category</label>
                            <div className="relative">
                                <select 
                                    name="category"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                                >
                                    <option value="GENERAL">General Repair</option>
                                    <option value="MOBILE">Mobile Repair</option>
                                    <option value="TV">TV Repairing</option>
                                    <option value="MOTOR">Motor Repairing</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedCategory === 'MOTOR' ? (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 bg-slate-50/50 rounded-2xl p-7 border border-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                                <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Equipment / Motor Type</label>
                                    <div className="relative">
                                        <select 
                                            name="deviceType"
                                            required
                                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select motor type</option>
                                            <option value="MONO_BLOCK">Mono Block Pump</option>
                                            <option value="SUBMERSIBLE">Submersible Motor</option>
                                            <option value="SEWELL">Sewell / Open Well</option>
                                            <option value="ELECTRIC_MOTOR">Electric Motor</option>
                                            <option value="GENERATOR">Generator</option>
                                            <option value="STABILIZER">Stabilizer</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Phase</label>
                                    <div className="relative">
                                        <select 
                                            name="motor.phase"
                                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                                            defaultValue="Single"
                                        >
                                            <option value="Single">Single phase</option>
                                            <option value="Double">Double phase</option>
                                            <option value="Triple">Triple phase</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Model / Serial No.</label>
                                    <input name="deviceModel" placeholder="e.g. KV12345" className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Motor Power</label>
                                    <div className="flex gap-2">
                                        <input name="motor.power" placeholder="Value" className="flex h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                                        <div className="relative w-28">
                                            <select name="motor.power_unit" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer">
                                                <option value="HP">HP</option>
                                                <option value="kW">kW</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7 animate-in fade-in slide-in-from-top-2">
                             <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Device Type</label>
                                <div className="relative">
                                    <select 
                                        name="deviceType"
                                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="Mobile">Mobile Phone</option>
                                        <option value="Laptop">Laptop / PC</option>
                                        <option value="Tablet">Tablet</option>
                                        <option value="TV">TV (LED/LCD)</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Brand & Model</label>
                                <input 
                                    name="deviceModel"
                                    required
                                    placeholder="e.g. Samsung S23"
                                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                />
                             </div>
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Issue Description</label>
                        <textarea 
                            name="problemDesc"
                            required
                            rows={3}
                            placeholder="Briefly explain the problem..."
                            className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm resize-none"
                        />
                    </div>
                </div>

                {/* Section 3: Service Details */}
                <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Receipt className="w-4 h-4" /> Billing & Estimates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-7">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Delivery Date</label>
                            <input 
                                name="expectedAt"
                                type="date"
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Estimated Net (₹)</label>
                            <input 
                                name="estimatedCost"
                                type="number"
                                min="0"
                                placeholder="0"
                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Advance Paid (₹)</label>
                            <input 
                                name="advanceAmount"
                                type="number"
                                min="0"
                                placeholder="0"
                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-10 border-t border-slate-100 mt-12 flex justify-end">
                <button 
                    type="submit" 
                    disabled={loading}
                    className={cn(
                        "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all h-12 px-10 gap-3 shadow-sm w-full md:w-auto overflow-hidden",
                        loading 
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                            : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
                    )}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Creating Job Sheet...</span>
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4" />
                            <span>Create Job Sheet</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    </div>
  );
}
