"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, Smartphone, AlertTriangle, Store, CalendarCheck, Clock, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";
import DownloadButton from "./download-button";
import { QRCodeCanvas } from "qrcode.react";

export default function VerifyCard({ data }: {
    data: {
        id: string;
        shortCode: string;
        status: string;
        expiresAt: string | Date;
        issuedAt: string | Date;
        deviceModel: string;
        repairType: string;
        shop: {
            shopName: string;
            address?: string | null;
        }
    }
}) {
    const router = useRouter();
    const cardRef = useRef<HTMLDivElement>(null);
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    const isExpired = data.status === "EXPIRED" || new Date() > new Date(data.expiresAt);


    return (
        <div className="w-full max-w-md flex flex-col gap-8">


            {/* Premium Certificate Card */}
            <div
                ref={cardRef}
                className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden relative"
                style={{
                    backgroundImage: 'radial-gradient(circle at top right, #f8fafc, #ffffff)'
                }}
            >
                {/* Top Accent Bar */}
                <div className={cn("h-2 w-full", isExpired ? "bg-rose-500" : "bg-emerald-500")} />

                <div className="p-8 pb-10 relative">
                    {/* Subtle Watermark/Pattern */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

                    {/* Header */}
                    <div className="text-center relative z-10">
                        <div className="inline-flex items-center gap-2 mb-8 bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full">
                            <ShieldCheck className="h-4 w-4 text-indigo-600" />
                            <span className="text-xs font-bold text-slate-600 tracking-wide">Official Warranty Certificate</span>
                        </div>

                        {/* Hero Status */}
                        <div className="flex flex-col items-center gap-4 mb-8">
                            <div className={cn(
                                "p-4 rounded-full border-[6px] shadow-sm",
                                isExpired ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                            )}>
                                {isExpired ? <AlertTriangle className="h-10 w-10 stroke-[2.5px]" /> : <CheckCircle2 className="h-10 w-10 stroke-[2.5px]" />}
                            </div>
                            <div>
                                <h1 className={cn("text-2xl font-bold tracking-tight mb-1", isExpired ? "text-rose-600" : "text-slate-900")}>
                                    {isExpired ? "Warranty Expired" : "Active Warranty"}
                                </h1>
                                <p className="text-sm font-medium text-slate-400 tracking-widest">
                                    ID: <span className="text-slate-900">{data.shortCode}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Box */}
                    <div className="bg-slate-50/80 rounded-2xl border border-slate-100 p-1 relative z-10">
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100/50 space-y-5">

                            {/* Shop Info */}
                            <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                                    <Store className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-indigo-500 tracking-wider mb-0.5">Authorized Partner</div>
                                    <div className="font-bold text-slate-900 leading-tight">{data.shop.shopName}</div>
                                    <div className="text-xs text-slate-500 mt-1 line-clamp-1">{data.shop.address || "Location Verified"}</div>
                                </div>
                            </div>

                            {/* Grid Details */}
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                <div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 tracking-wider mb-1.5">
                                        <Smartphone className="h-3 w-3" /> Device
                                    </div>
                                    <div className="font-semibold text-slate-900 text-sm">
                                        {data.deviceModel}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 tracking-wider mb-1.5">
                                        <Check className="h-3 w-3" /> Service
                                    </div>
                                    <div className="font-semibold text-slate-900 text-sm">
                                        {data.repairType}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 tracking-wider mb-1.5">
                                        <CalendarCheck className="h-3 w-3" /> Issued On
                                    </div>
                                    <div className="font-medium text-slate-700 text-sm">
                                        {new Date(data.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 tracking-wider mb-1.5">
                                        <Clock className="h-3 w-3" /> Valid Till
                                    </div>
                                    <div className={cn("font-bold text-sm", isExpired ? "text-rose-500" : "text-emerald-600")}>
                                        {new Date(data.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer / QR */}
                    <div className="mt-8 flex items-end justify-between relative z-10">
                        <div className="text-left">
                            <div className="text-[10px] font-bold text-slate-400 mb-2 tracking-widest">Authenticity Verified By</div>
                            <div className="inline-flex items-center gap-2">
                                <ShieldCheck className="h-6 w-6 text-indigo-600 fill-indigo-100" />
                                <span className="text-xl font-bold text-indigo-600 tracking-tight">FixSure</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-white p-1 rounded-lg border border-slate-100 shadow-sm inline-block">
                                {origin && (
                                    <QRCodeCanvas
                                        value={`${origin}/verify/${data.shortCode}`}
                                        size={64}
                                        level={"M"}
                                        bgColor={"#ffffff"}
                                        fgColor={"#0f172a"}
                                    />
                                )}
                            </div>
                            <div className="text-[9px] text-slate-400 mt-1 font-medium">Scan to Verify</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
                <DownloadButton cardRef={cardRef as React.RefObject<HTMLDivElement>} fileName={`Warranty-${data.shortCode}`} />

                <div className="mt-8 flex flex-col items-center gap-1">
                    <span className="text-zinc-500 text-sm">Own a repair shop?</span>
                    <Link
                        href="/dashboard"
                        className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 transition-colors"
                    >
                        Go Back to Dashboard<ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
