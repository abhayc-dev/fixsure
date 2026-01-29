"use client";

import { useState } from "react";
import { Loader2, Plus, Wrench, Smartphone, User, MapPin, Calendar, Receipt, FileText, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { createJobSheet } from "@/lib/actions";
import { cn } from "@/lib/utils";

export default function CreateJobSheetForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("GENERAL");

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setStatus(null);
    try {
        await createJobSheet(formData);
        setStatus({ type: 'success', message: "Job Sheet created successfully!" });
        // Optional: wait a moment before redirecting
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
        <form action={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            
            {/* Integrated Header */}
            <div className="flex items-start gap-4 mb-8">
                 <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                     <Wrench className="h-6 w-6" />
                 </div>
                 <div>
                     <h2 className="text-xl font-bold text-slate-800">New Repair Job Sheet</h2>
                     <p className="text-sm text-slate-400 mt-1">
                         Create a new service entry for a customer device repair.
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

            <div className="space-y-8">
                
                {/* Section 1: Customer Details */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                        <User className="w-4 h-4" /> Customer Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                Customer Name
                            </label>
                            <input 
                                name="customerName"
                                required
                                placeholder="e.g. Amit Sharma"
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                Mobile Number
                            </label>
                            <input 
                                name="customerPhone"
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
                            Address
                        </label>
                        <input 
                            name="customerAddress"
                            placeholder="e.g. Flat 402, Sunshine Apts, Delhi"
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Section 2: Job Type & Device Info */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Smartphone className="w-4 h-4" /> Technical Info
                    </h3>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            Job Category
                        </label>
                        <div className="relative">
                            <select 
                                name="category"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm appearance-none"
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

                    {selectedCategory === 'MOTOR' ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in slide-in-from-top-2">
                             <input type="hidden" name="deviceType" value="Electric Motor" />
                             
                             <div className="space-y-3">
                                <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">Starter Type</label>
                                <input name="tech_starter" placeholder="e.g. DOL, Star Delta" className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-sm" />
                             </div>
                             <div className="space-y-3">
                                <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">Power / HP</label>
                                <input name="tech_power" placeholder="e.g. 2HP, 5KW" className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-sm" />
                             </div>
                             <div className="space-y-3">
                                <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">Winding (Bounding) 1</label>
                                <input name="tech_winding1" placeholder="Value 1" className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-sm" />
                             </div>
                             <div className="space-y-3">
                                <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">Winding (Bounding) 2</label>
                                <input name="tech_winding2" placeholder="Value 2" className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-sm" />
                             </div>
                             <div className="space-y-3">
                                <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">Winding (Bounding) 3</label>
                                <input name="tech_winding3" placeholder="Value 3" className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-sm" />
                             </div>
                             <div className="space-y-3">
                                <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">Winding (Bounding) 4</label>
                                <input name="tech_winding4" placeholder="Value 4" className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-sm" />
                             </div>
                             <div className="space-y-3 md:col-span-2">
                                <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">Model / Serial No.</label>
                                <input name="deviceModel" placeholder="Motor Model / Serial" className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-sm" />
                             </div>
                         </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in slide-in-from-top-2">
                             <div className="space-y-3">
                                <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                    Device Type
                                </label>
                                <div className="relative">
                                    <select 
                                        name="deviceType"
                                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm appearance-none"
                                    >
                                        <option value="Mobile">Mobile Phone</option>
                                        <option value="Laptop">Laptop / PC</option>
                                        <option value="Tablet">Tablet</option>
                                        <option value="TV">TV (LED/LCD)</option>
                                        <option value="Refrigerator">Refrigerator</option>
                                        <option value="WashingMachine">Washing Machine</option>
                                        <option value="AC">Air Conditioner</option>
                                        <option value="Microwave">Microwave</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                             </div>
                             <div className="space-y-3">
                                <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                    Brand & Model
                                </label>
                                <input 
                                    name="deviceModel"
                                    required
                                    placeholder="e.g. Samsung S23 Ultra"
                                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                />
                             </div>
                        </div>
                    )}
                    
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            Problem Description
                        </label>
                        <textarea 
                            name="problemDesc"
                            required
                            rows={3}
                            placeholder="Describe the issue..."
                            className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm resize-none"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            Accessories Received
                        </label>
                        <input 
                            name="accessories"
                            placeholder="e.g. Adapter, Remote, Cover"
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Section 3: Service Details */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Receipt className="w-4 h-4" /> Service Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                Est. Delivery Date
                            </label>
                            <input 
                                name="expectedAt"
                                type="date"
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                Estimated Cost (₹)
                            </label>
                            <input 
                                name="estimatedCost"
                                type="number"
                                min="0"
                                placeholder="0.00"
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                            />
                        </div>
                         <div className="space-y-3 mb-5">
                            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                Advance Paid (₹)
                            </label>
                            <input 
                                name="advanceAmount"
                                type="number"
                                min="0"
                                placeholder="0.00"
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </div>

            </div>

             <div className="pt-6 border-t border-slate-100 mt-2 mb-[-6px]">
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
                    Create Job Sheet
                </button>
            </div>
        </form>
    </div>
  );
}
