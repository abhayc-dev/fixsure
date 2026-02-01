import { ArrowLeft, Clock, MapPin, Smartphone, User, DollarSign, Calendar, Eye, FileText, CheckCircle, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

type Warranty = {
    id: string;
    shortCode: string;
    customerName: string;
    customerPhone: string;
    customerAddress?: string | null; // Added
    deviceModel: string;
    repairType: string;
    repairCost: number | null;
    durationDays: number;
    issuedAt: Date;
    expiresAt: Date;
    status: string;
    privateNote?: string | null;
};

export default function WarrantyDetailsView({ warranty, onBack, onOpenCard }: { warranty: Warranty, onBack: () => void, onOpenCard: () => void }) {

    // Verification URL
    const verificationUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/verify/${warranty.shortCode}`
        : `https://fixsure.app/verify/${warranty.shortCode}`;

    return (
        <div className="max-w-4xl mx-auto space-y-6 mt-6 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-full px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all active:scale-[0.98]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={onOpenCard}
                        className="flex items-center gap-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-5 py-2.5 text-sm font-bold hover:bg-slate-200 transition-all active:scale-[0.98]"
                    >
                        <FileText className="h-4 w-4" />
                        View Certificate
                    </button>
                    {/* Add Edit Button here later if needed */}
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
        </div>
    );
}
