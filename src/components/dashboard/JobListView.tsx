"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Wrench,
    Calendar,
    Activity,
    CheckCircle,
    Truck,
    Inbox,
    ArrowRight,
    Loader2,
    X,
    XCircle,
    MoreHorizontal,
    Printer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateJobStatus } from "@/lib/actions";
import { generateJobBill } from "@/lib/print-utils";

type JobSheet = {
    id: string;
    jobId: string;
    customerName: string;
    customerPhone: string;
    customerAddress?: string | null;
    deviceType?: string | null;
    deviceModel: string;
    problemDesc: string;
    accessories?: string | null;
    status: string;
    receivedAt: Date;
    expectedAt: Date | null;
    estimatedCost: number | null;
    advanceAmount?: number | null;
    category?: string;
    technicalDetails?: Record<string, any> | null;
};

type Shop = {
    shopName: string;
    address: string | null;
    city: string | null;
    phone: string;
    gstNumber?: string | null;
};

export default function JobListView({ initialJobSheets, shop }: { initialJobSheets: JobSheet[], shop: Shop }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Client-side filtering
    const filteredJobSheets = initialJobSheets.filter(j =>
        (statusFilter === 'ALL' || j.status === statusFilter) &&
        (j.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            j.customerPhone.includes(searchTerm) ||
            j.jobId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-fade-in ">
            {/* Stats Summary for Jobs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <JobSummaryCard title="In Intake" count={initialJobSheets.filter(j => j.status === 'RECEIVED').length} color="blue" />
                <JobSummaryCard title="Under Repair" count={initialJobSheets.filter(j => j.status === 'IN_PROGRESS').length} color="amber" />
                <JobSummaryCard title="Ready to Go" count={initialJobSheets.filter(j => j.status === 'READY').length} color="emerald" />
                <JobSummaryCard title="Delivered" count={initialJobSheets.filter(j => j.status === 'DELIVERED').length} color="slate" />
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden flex flex-col min-h-[500px]">
                {/* Control Bar */}
                <div className="p-8 bg-slate-50/40 backdrop-blur-sm flex flex-col lg:flex-row gap-6 items-center border-b border-slate-200/50">
                    <div className="relative flex-1 group w-full">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                            <Search className="h-5 w-5" />
                        </div>
                        <input
                            placeholder="Find job by name, device, or repair ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-14 pr-6 rounded-[1.25rem] bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-base font-normal text-slate-700 placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                        {['ALL', 'RECEIVED', 'IN_PROGRESS', 'READY', 'DELIVERED'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={cn(
                                    "h-12 px-6 rounded-2xl text-xs font-bold tracking-wider whitespace-nowrap transition-all border active:scale-95 font-display shadow-sm cursor-pointer uppercase",
                                    statusFilter === s
                                        ? "bg-primary text-white border-primary shadow-xl shadow-slate-200"
                                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                                )}
                            >
                                {s === 'IN_PROGRESS' ? 'WORKING' : s.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/60 text-xs font-bold text-slate-500 tracking-widest border-b border-slate-200 font-display uppercase">
                                <th className="px-6 py-5">Sequence</th>
                                <th className="px-6 py-5">Client Profile</th>
                                <th className="px-6 py-5">Machine Class</th>
                                <th className="px-6 py-4">Schedule</th>
                                <th className="px-6 py-4">Current State</th>
                                <th className="px-6 py-4 text-right">Valuation</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {filteredJobSheets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="h-24 w-24 bg-slate-50 rounded-[40%] flex items-center justify-center rotate-12 border border-slate-200">
                                                <Wrench className="h-10 w-10 text-slate-400" />
                                            </div>
                                            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">No active job matrices found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredJobSheets.map((j) => (
                                    <tr
                                        key={j.id}
                                        onClick={() => router.push(`/jobs/${j.id}`)}
                                        className="hover:bg-slate-100/60 hover:shadow-sm transition-all duration-300 group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col text-left group-hover:scale-105 transition-transform">
                                                    <span className="text-primary font-bold tracking-widest text-[10px] uppercase">RI-STORE</span>
                                                    <span className="text-slate-900 font-bold font-mono text-base mt-0.5">{j.jobId.split('-')[1]}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="text-slate-900 font-bold text-base group-hover/cell:text-primary transition-colors">{j.customerName}</div>
                                                <div className="text-xs text-slate-500 font-bold tracking-wider mt-0.5">{j.customerPhone}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-900 font-bold text-sm">
                                            {j.deviceModel}
                                        </td>
                                        <td className="px-6 py-4">
                                            {j.expectedAt ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-500 leading-none mb-1 uppercase tracking-wider">DUE</span>
                                                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                                                        <Calendar className="h-4 w-4 text-primary/60" />
                                                        {(() => {
                                                            const date = new Date(j.expectedAt);
                                                            const day = date.getDate().toString().padStart(2, '0');
                                                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                                            return `${day} ${months[date.getMonth()]}`;
                                                        })()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-200">--/--</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-2">
                                                <JobStatusBadge status={j.status} />
                                                <JobActionMenu job={j} shop={shop} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-bold text-slate-500 tracking-widest mb-1 uppercase">QUOTE</span>
                                                <div className="text-slate-900 font-bold text-lg font-mono">
                                                    {j.estimatedCost ? `₹${j.estimatedCost.toLocaleString()}` : '---'}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Active Processing</span>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{filteredJobSheets.length} Records Loaded</span>
                </div>
            </div>
        </div>
    );
}

function JobSummaryCard({ title, count, color }: { title: string, count: number, color: 'blue' | 'amber' | 'emerald' | 'slate' }) {
    const colorMap = {
        blue: "from-blue-500/10 to-transparent border-blue-500/20 text-blue-600",
        amber: "from-amber-500/10 to-transparent border-amber-500/20 text-amber-600",
        emerald: "from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-600",
        slate: "from-slate-500/10 to-transparent border-slate-500/20 text-slate-600"
    };

    return (
        <div className={cn("p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4 bg-gradient-to-br transition-all hover:shadow-xl hover:-translate-y-1 duration-300 group relative overflow-hidden", colorMap[color])}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.05] rounded-full blur-3xl -z-0" />

            <span className="text-xs font-bold tracking-widest opacity-80 font-display relative z-10 uppercase">{title}</span>
            <div className="flex items-center justify-between relative z-10">
                <span className="text-4xl font-bold font-display tracking-tight text-slate-900">{count}</span>
                <div className={cn("p-4 rounded-2xl bg-white/80 border border-current/10 shadow-sm backdrop-blur-sm group-hover:scale-110 transition-transform duration-500")}>
                    {color === 'blue' && <Inbox className="h-6 w-6" />}
                    {color === 'amber' && <Activity className="h-6 w-6" />}
                    {color === 'emerald' && <CheckCircle className="h-6 w-6" />}
                    {color === 'slate' && <Truck className="h-6 w-6" />}
                </div>
            </div>
        </div>
    );
}

function JobStatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string, border: string, text: string, dot: string }> = {
        'RECEIVED': { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
        'IN_PROGRESS': { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", dot: "bg-amber-500 animate-pulse" },
        'READY': { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
        'DELIVERED': { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600", dot: "bg-slate-400" },
        'CANCELLED': { bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-700", dot: "bg-rose-500" }
    };

    const c = config[status] || config['RECEIVED'];

    return (
        <span className={cn(
            "px-3 py-1.5 rounded-2xl text-[10px] font-bold tracking-widest inline-flex items-center gap-2 border shadow-sm",
            c.bg, c.text, c.border
        )}>
            <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]", c.dot)} />
            {status.replace('_', ' ')}
        </span>
    );
}

function JobActionMenu({ job, shop }: { job: JobSheet, shop: Shop }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpdate = async (status: string) => {
        setLoading(true);
        await updateJobStatus(job.id, status);
        setLoading(false);
        setIsOpen(false);
        router.refresh();
    };

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                title="Update Status / Print"
            >
                Action <MoreHorizontal className="h-3 w-3" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-20 animate-fade-in divide-y divide-gray-100 overflow-hidden">

                        <div className="py-1">
                            <button
                                onClick={() => {
                                    generateJobBill(shop, job);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 group"
                            >
                                <span className="p-1.5 bg-slate-100 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <Printer className="h-4 w-4 text-slate-600" />
                                </span>
                                <span className="font-semibold">Print Job Sheet</span>
                            </button>
                        </div>

                        <div className="py-1">
                            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 tracking-wider">Update Status</div>
                            {[
                                { label: 'Received', value: 'RECEIVED' },
                                { label: 'In Progress', value: 'IN_PROGRESS' },
                                { label: 'Ready for Pickup', value: 'READY' },
                                { label: 'Delivered', value: 'DELIVERED' },
                                { label: 'Cancelled', value: 'CANCELLED' }
                            ].map((s) => (
                                <button
                                    key={s.value}
                                    onClick={() => handleUpdate(s.value)}
                                    disabled={loading || job.status === s.value}
                                    className={cn(
                                        "block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50",
                                        job.status === s.value ? "text-blue-600 font-bold bg-blue-50/50" : "text-gray-700"
                                    )}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
