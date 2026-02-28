"use client";

import { ArrowLeft, Clock, MapPin, Smartphone, User, DollarSign, Calendar, Eye, FileText, CheckCircle, ShieldCheck, X, Trash2, Edit, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteWarranty, updateWarranty } from "@/lib/actions";

type Warranty = {
    id: string;
    shortCode: string;
    customerName: string;
    customerPhone: string;
    customerAddress?: string | null;
    deviceModel: string;
    repairType: string;
    repairCost: number | null;
    durationDays: number;
    issuedAt: Date;
    expiresAt: Date;
    status: string;
    privateNote?: string | null;
};

export default function WarrantyDetailsView({ warranty, onBack }: { warranty: Warranty, onBack?: () => void }) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    // Verification URL
    const verificationUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/verify/${warranty.shortCode}`
        : `https://fixsure.app/verify/${warranty.shortCode}`;

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [editDurationSelection, setEditDurationSelection] = useState<string>(() => {
        const d = warranty.durationDays;
        if ([15, 30, 90, 180].includes(d)) return d.toString();
        return "custom";
    });

    const [editCustomDate, setEditCustomDate] = useState(() => {
        if (warranty.expiresAt) {
            return new Date(warranty.expiresAt).toISOString().split('T')[0];
        }
        return "";
    });

    const handleDelete = () => {
        setError(null);
        startTransition(async () => {
            try {
                await deleteWarranty(warranty.id);
                if (onBack) {
                    onBack();
                } else {
                    router.push('/warranties');
                    router.refresh();
                }
            } catch (err: any) {
                setError(err.message || 'Failed to delete warranty');
            }
        });
    };

    const handleEditSubmit = (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            try {
                if (editDurationSelection === "custom" && editCustomDate) {
                    const issued = new Date(warranty.issuedAt);
                    issued.setHours(0, 0, 0, 0);
                    const selected = new Date(editCustomDate);
                    selected.setHours(0, 0, 0, 0);
                    const diffTime = selected.getTime() - issued.getTime();
                    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                    formData.set("duration", diffDays.toString());
                } else {
                    formData.set("duration", editDurationSelection);
                }

                await updateWarranty(warranty.id, formData);
                setIsEditDialogOpen(false);
                router.refresh();
            } catch (err: any) {
                setError(err.message || 'Failed to update warranty');
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
            {/* Header Replacement */}
            <div className="flex items-center justify-between pb-2">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-full px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all active:scale-[0.98]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <div className="flex flex-wrap items-center gap-2 justify-end">
                    <button
                        onClick={() => setIsEditDialogOpen(true)}
                        className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 shadow-sm rounded-full px-5 py-2.5 text-sm font-bold hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.98]"
                    >
                        <Edit className="h-4 w-4" />
                        Edit
                    </button>
                    <button
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="flex items-center gap-2 bg-white text-red-600 border border-red-200 shadow-sm rounded-full px-5 py-2.5 text-sm font-bold hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all active:scale-[0.98]"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                    <Link
                        href={`/warranties/${warranty.id}/certificate`}
                        className="flex items-center gap-2 bg-slate-100 text-slate-600 border border-slate-200 shadow-sm rounded-full px-5 py-2.5 text-sm font-bold hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-[0.98]"
                    >
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">View Certificate</span>
                        <span className="sm:hidden">Certificate</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Details Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="border-b border-slate-100 p-6 flex items-start justify-between bg-slate-50/50">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Warranty Details</h1>
                                <p className="text-sm text-slate-500">
                                    ID: <span className="font-mono font-bold text-slate-700">{warranty.shortCode}</span>
                                </p>
                            </div>
                            <div className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold tracking-wide border flex items-center gap-1.5",
                                warranty.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                    warranty.status === 'EXPIRED' ? "bg-slate-100 text-slate-500 border-slate-200" :
                                        "bg-red-50 text-red-700 border-red-200"
                            )}>
                                {warranty.status === 'ACTIVE' && <CheckCircle className="h-3.5 w-3.5" />}
                                {warranty.status}
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Customer Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                                        <User className="h-4 w-4" /> Customer Info
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Full Name</div>
                                            <div className="text-base font-bold text-slate-900">{warranty.customerName}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Phone Number</div>
                                            <div className="text-base font-bold text-slate-900">{warranty.customerPhone}</div>
                                        </div>
                                        {warranty.customerAddress && (
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Address</div>
                                                <div className="text-base font-semibold text-slate-700 leading-relaxed">{warranty.customerAddress}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                                        <Smartphone className="h-4 w-4" /> Device Info
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Device Model</div>
                                            <div className="text-base font-bold text-slate-900">{warranty.deviceModel}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Repair Type</div>
                                            <div className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-bold inline-block border border-slate-200">
                                                {warranty.repairType}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 my-6"></div>

                            {/* Financials & Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" /> Costing
                                    </h3>
                                    <div>
                                        <div className="text-sm font-medium text-slate-500">Repair Cost</div>
                                        <div className="text-2xl font-bold text-slate-900">₹{(warranty.repairCost || 0).toLocaleString()}</div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> Validity
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <div className="text-xs font-medium text-slate-500">Issued On</div>
                                            <div className="text-sm font-bold text-slate-900">{new Date(warranty.issuedAt).toLocaleDateString()}</div>
                                        </div>
                                        <div className="h-8 w-px bg-slate-200"></div>
                                        <div>
                                            <div className="text-xs font-medium text-slate-500">Expires On</div>
                                            <div className={cn("text-sm font-bold", warranty.status === 'ACTIVE' ? "text-emerald-600" : "text-slate-900")}>
                                                {new Date(warranty.expiresAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs font-medium text-slate-400 bg-slate-50 inline-block px-2 py-1 rounded">
                                        {warranty.durationDays} Days Duration
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar Stats / QR */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
                        <div className="text-xs font-bold text-slate-400 tracking-widest mb-4">Verification QR</div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <QRCodeSVG value={verificationUrl} size={140} fgColor="#0f172a" />
                        </div>
                        <p className="text-xs text-slate-400 mt-4 leading-relaxed px-4">
                            Scan this QR code to verify details and check live status.
                        </p>
                    </div>

                    <div className="bg-slate-900 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldCheck className="h-24 w-24" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-1">Need Help?</h3>
                            <p className="text-slate-400 text-sm mb-4">Contact support if you need to update incorrect details.</p>
                            <Link href="#" className="text-primary font-bold text-sm hover:underline">Contact Admin</Link>
                        </div>
                    </div>
                </div>
            </div>

            {
                isDeleteDialogOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up relative">
                            <button
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="p-8 pb-6 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-50 text-red-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm border border-red-100">
                                    <AlertCircle className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2 font-display">Delete Warranty?</h3>
                                <p className="text-slate-500 font-medium">Are you sure you want to delete this warranty for <strong className="text-slate-700">{warranty.customerName}</strong>? This action cannot be undone.</p>

                                {error && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl w-full">
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 pt-0 flex gap-3">
                                <button
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                    disabled={isPending}
                                    className="flex-1 px-5 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isPending}
                                    className="flex-1 px-5 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Modal */}
            {
                isEditDialogOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 relative overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Edit className="h-6 w-6 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800">Edit Warranty</h2>
                                </div>
                                <button
                                    onClick={() => setIsEditDialogOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 rounded-full transition-colors border border-slate-100 shadow-sm"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6">
                                <form id="edit-warranty-form" action={handleEditSubmit} className="space-y-6">
                                    {error && (
                                        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl flex items-center gap-2 font-bold mb-6">
                                            <AlertCircle className="h-5 w-5" /> {error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Customer Name</label>
                                            <input
                                                name="customer"
                                                required
                                                defaultValue={warranty.customerName}
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-medium text-slate-900"
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
                                                defaultValue={warranty.customerPhone}
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-mono text-slate-900"
                                                placeholder="10-digit number"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Customer Address <span className="text-slate-400 font-normal">(Optional)</span></label>
                                        <input
                                            name="address"
                                            defaultValue={warranty.customerAddress || ""}
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all text-slate-900"
                                            placeholder="e.g. Sector 62, Noida"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Device Model</label>
                                        <input
                                            name="device"
                                            required
                                            defaultValue={warranty.deviceModel}
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-medium text-slate-900"
                                            placeholder="e.g. iPhone 13, Samsung AC 1.5T"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Repair Description</label>
                                            <input
                                                name="issue"
                                                required
                                                defaultValue={warranty.repairType}
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all text-slate-900"
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
                                                defaultValue={warranty.repairCost || ""}
                                                placeholder="e.g. 1500"
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-mono font-bold text-slate-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Warranty Period</label>
                                        <div className="relative">
                                            <select
                                                name="durationSelection"
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none appearance-none font-medium text-slate-600"
                                                value={editDurationSelection}
                                                onChange={(e) => setEditDurationSelection(e.target.value)}
                                            >
                                                <option value="15">15 Days</option>
                                                <option value="30">30 Days (Standard)</option>
                                                <option value="90">3 Months</option>
                                                <option value="180">6 Months</option>
                                                <option value="custom">Custom Date</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                        {editDurationSelection === 'custom' && (
                                            <div className="pt-2">
                                                <input
                                                    type="date"
                                                    name="customDate"
                                                    value={editCustomDate}
                                                    onChange={(e) => setEditCustomDate(e.target.value)}
                                                    required={editDurationSelection === 'custom'}
                                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all text-slate-900 font-medium"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-slate-100 flex gap-4 shrink-0 bg-slate-50/50">
                                <button
                                    type="button"
                                    onClick={() => setIsEditDialogOpen(false)}
                                    disabled={isPending}
                                    className="flex-1 h-12 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-white hover:text-slate-900 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="edit-warranty-form"
                                    disabled={isPending}
                                    className="flex-1 h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                                >
                                    {isPending ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
