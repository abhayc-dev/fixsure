"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, XCircle, Loader2, ArrowRight } from "lucide-react";
import { createWarranty } from "@/lib/actions";

export default function CreateWarrantyForm({ onSuccess }: { onSuccess?: () => void }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);
        try {
            await createWarranty(formData);
            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/warranties');
                router.refresh();
            }
        } catch (e: any) {
            setError(e.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Issue New Warranty</h2>
                </div>
            </div>

            <form action={handleSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                        <XCircle className="h-4 w-4" /> {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Customer Name</label>
                        <input
                            name="customer"
                            required
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-medium"
                            placeholder="Customer Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Mobile Number</label>
                        <input
                            name="phone"
                            required
                            type="tel"
                            maxLength={10}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-mono"
                            placeholder="10-digit number"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Customer Address <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input
                        name="address"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all"
                        placeholder="e.g. Sector 62, Noida"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Device Model</label>
                    <input
                        name="device"
                        required
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-medium"
                        placeholder="e.g. iPhone 13, Samsung AC 1.5T"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Repair Description</label>
                        <input
                            name="issue"
                            required
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all"
                            placeholder="e.g. Screen Replacement"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Repair Cost (₹)</label>
                        <input
                            name="price"
                            type="number"
                            min="0"
                            step="10"
                            required
                            placeholder="e.g. 1500"
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-mono font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Warranty Period</label>
                    <div className="relative">
                        <select
                            name="duration"
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none appearance-none font-medium text-slate-600"
                            defaultValue="30"
                        >
                            <option value="15">15 Days</option>
                            <option value="30">30 Days (Standard)</option>
                            <option value="90">3 Months</option>
                            <option value="180">6 Months</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex gap-4 border-t border-slate-100">
                    <button type="button" onClick={() => router.back()} className="flex-1 h-14 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] h-14 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-sm tracking-wide active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                            <>
                                <span>Generate & Send SMS</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
