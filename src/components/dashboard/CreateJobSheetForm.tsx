"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, X, Loader2, ArrowRight, XCircle } from "lucide-react";
import { createJobSheet } from "@/lib/actions";

export default function CreateJobSheetForm({
    onSuccess,
    shopCategory
}: {
    onSuccess?: () => void,
    shopCategory?: string
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);
        try {
            await createJobSheet(formData);
            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/jobs');
                router.refresh();
            }
        } catch (e: any) {
            setError(e.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Wrench className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">New Repair Job Sheet</h2>
                </div>
            </div>

            <form action={handleSubmit} className="p-6 space-y-8">
                {error && (
                    <div className="bg-rose-50 text-rose-600 text-sm p-4 rounded-xl flex items-center gap-3 border border-rose-100">
                        <XCircle className="h-5 w-5" /> {error}
                    </div>
                )}

                {/* Customer Details */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 tracking-wider flex items-center gap-3 uppercase">
                        <span className="w-6 h-[2px] bg-slate-200"></span> Customer Profile
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Customer Name</label>
                            <input
                                name="customerName"
                                required
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-medium"
                                placeholder="Enter full name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Mobile Number</label>
                            <input
                                name="customerPhone"
                                required
                                type="tel"
                                maxLength={10}
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-mono"
                                placeholder="10-digit number"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Address <span className="text-slate-400 font-normal">(Optional)</span></label>
                        <input
                            name="customerAddress"
                            placeholder="e.g. House No, Street, City"
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Device Details */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 tracking-wider flex items-center gap-3 uppercase">
                        <span className="w-6 h-[2px] bg-slate-200"></span> Device Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Device Type</label>
                            <select
                                name="deviceType"
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none appearance-none font-medium text-slate-600"
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
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Brand & Model</label>
                            <input
                                name="deviceModel"
                                required
                                placeholder="e.g. Samsung S23 Ultra"
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-medium"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Problem Description</label>
                        <textarea
                            name="problemDesc"
                            required
                            rows={3}
                            placeholder="Describe the issue in detail..."
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none resize-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Accessories Received</label>
                        <input
                            name="accessories"
                            placeholder="e.g. Charger, Original Box, Cover"
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Service Details */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 tracking-wider flex items-center gap-3 uppercase">
                        <span className="w-6 h-[2px] bg-slate-200"></span> Service Estimate
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Expected Delivery</label>
                            <input
                                name="expectedAt"
                                type="date"
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-medium text-slate-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Estimated Cost (₹)</label>
                            <input
                                name="estimatedCost"
                                type="number"
                                min="0"
                                placeholder="0.00"
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-mono font-bold text-slate-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Advance Paid (₹)</label>
                            <input
                                name="advanceAmount"
                                type="number"
                                min="0"
                                placeholder="0.00"
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-mono font-bold text-slate-900"
                            />
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
                                <span>Create Job Sheet</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
