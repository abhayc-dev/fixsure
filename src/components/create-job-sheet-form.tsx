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
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
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
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
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
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
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
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm appearance-none"
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
                        <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 md:col-span-2">
                            {/* Hidden field for backend categorisation if needed */}
                            <input type="hidden" name="deviceType" value="Electric Motor" />

                            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-8">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <div className="bg-primary/10 p-2 rounded-lg">
                                        <Wrench className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">Motor Repair – Technical Details</h3>
                                </div>

                                {/* Motor Basics */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        Motor Basics
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 ml-1">Power / HP</label>
                                            <input 
                                                name="motor.power" 
                                                placeholder="e.g. 2HP, 5KW" 
                                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 ml-1">Starter Type</label>
                                            <input 
                                                name="motor.starter" 
                                                placeholder="e.g. DOL, Star Delta" 
                                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Winding / Bounding */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Winding / Bounding</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map((num) => (
                                            <div key={num} className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 ml-1">Winding {num}</label>
                                                <input 
                                                    name={`motor.winding${num}`} 
                                                    placeholder="Details..." 
                                                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Coil Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Running Coil */}
                                    <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            Running Coil
                                        </h4>
                                        <div className="space-y-4 text-slate-700">
                                            <div className="grid grid-cols-2 gap-4 ">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">Turns</label>
                                                    <input name="motor.running_turns" placeholder="Turns" className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50/30 px-3 text-sm focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 " />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">Wire Gauge</label>
                                                    <input name="motor.running_gauge" placeholder="Gauge" className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50/30 px-3 text-sm focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">Weight (kg)</label>
                                                <input name="motor.running_weight" type="number" step="0.001" placeholder="0.000" className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50/30 px-3 text-sm focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:appearance-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Starting Coil */}
                                    <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                                            Starting Coil
                                        </h4>
                                        <div className="space-y-4 text-slate-700">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">Turns</label>
                                                    <input name="motor.starting_turns" placeholder="Turns" className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50/30 px-3 text-sm focus:bg-white transition-all outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">Wire Gauge</label>
                                                    <input name="motor.starting_gauge" placeholder="Gauge" className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50/30 px-3 text-sm focus:bg-white transition-all outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">Weight (kg)</label>
                                                <input name="motor.starting_weight" type="number" step="0.001" placeholder="0.000" className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50/30 px-3 text-sm focus:bg-white transition-all outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 focus:appearance-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Parts Replaced */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Parts Replaced</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {['Running Coil', 'Starting Coil', 'Capacitor', 'Bearing', 'Fan', 'Shaft'].map((part) => (
                                            <label key={part} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-primary/30 cursor-pointer transition-all hover:shadow-sm">
                                                <input 
                                                    type="checkbox" 
                                                    name="motor.parts" 
                                                    value={part}
                                                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20" 
                                                />
                                                <span className="text-sm font-medium text-slate-700">{part}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">Model / Serial No.</label>
                                <input name="deviceModel" placeholder="Motor Model / Serial" className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-sm" />
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
                                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm appearance-none"
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
                                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
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
                            className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm resize-none"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            Accessories Received
                        </label>
                        <input 
                            name="accessories"
                            placeholder="e.g. Adapter, Remote, Cover"
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
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
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
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
                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
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
                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </div>

            </div>

             <div className="pt-6 border-t border-slate-100 mt-2 mb-[-6px] flex justify-end">
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
