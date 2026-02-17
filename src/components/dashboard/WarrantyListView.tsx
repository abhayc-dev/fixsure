"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Filter,
    ShieldCheck,
    CheckCircle,
    DollarSign,
    Smartphone,
    Clock,
    MoreHorizontal,
    X,
    Eye,
    EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateWarrantyStatus } from "@/lib/actions";

type Warranty = {
    id: string;
    shortCode: string;
    customerName: string;
    customerPhone: string;
    deviceModel: string;
    repairType: string;
    repairCost: number | null;
    expiresAt: Date;
    status: string;
};

type Stats = {
    total: number;
    active: number;
    revenue: number;
    subscription: string;
}

export default function WarrantyListView({ initialWarranties, stats }: { initialWarranties: Warranty[], stats: Stats }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isRevenueVisible, setIsRevenueVisible] = useState(false);

    // Filter logic
    const filteredWarranties = initialWarranties.filter(w =>
        (statusFilter === 'ALL' || w.status === statusFilter) &&
        (w.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.customerPhone.includes(searchTerm) ||
            w.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Stats Summary Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                <StatCard
                    title="Total Certificates"
                    value={stats.total.toString()}
                    sub="+4% from last week"
                    icon={ShieldCheck}
                />
                <StatCard
                    title="Active Protection"
                    value={stats.active.toString()}
                    sub="Healthy Fleet"
                    highlight
                    icon={CheckCircle}
                />
                <StatCard
                    title="Store Revenue"
                    value={`₹${stats.revenue.toLocaleString()}`}
                    sub="Total Earnings"
                    secure
                    isVisible={isRevenueVisible}
                    onToggle={() => setIsRevenueVisible(!isRevenueVisible)}
                    icon={DollarSign}
                />
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex flex-col overflow-hidden animate-slide-up">
                {/* Control Bar */}
                <div className="p-8 bg-slate-50/40 backdrop-blur-sm flex flex-col md:flex-row gap-6 items-center border-b border-slate-200/50">
                    <div className="relative flex-1 group w-full">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                            <Search className="h-5 w-5" />
                        </div>
                        <input
                            placeholder="Search by name, phone, or ID code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-14 pr-6 rounded-[1.25rem] bg-white border border-slate-200/60 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-normal text-slate-700 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/60 text-xs font-bold text-slate-500 tracking-widest border-b border-slate-200 font-display uppercase">
                                <th className="px-6 py-5">Identity</th>
                                <th className="px-8 py-5">Customer Entry</th>
                                <th className="px-8 py-5">Machine Spec</th>
                                <th className="px-8 py-5 text-right">Valuation</th>
                                <th className="px-8 py-5">Term</th>
                                <th className="px-8 py-5">Live Status</th>
                                <th className="px-6 py-5 text-right">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredWarranties.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-32 text-center text-slate-300">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="p-6 bg-slate-50 rounded-full border border-slate-100">
                                                <Search className="h-12 w-12 opacity-20" />
                                            </div>
                                            <p className="font-bold tracking-widest text-[11px]">No matching records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredWarranties.map((w) => (
                                    <tr
                                        key={w.id}
                                        onClick={() => router.push(`/warranties/${w.id}`)}
                                        className="hover:bg-slate-100/60 hover:shadow-sm transition-all group cursor-pointer"
                                    >
                                        {/* ID */}
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-primary/70 leading-none mb-1.5 uppercase tracking-wider">ID CODE</span>
                                                <span className="text-base font-bold text-slate-900 font-mono hover:text-primary transition-colors">
                                                    {w.shortCode}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Customer */}
                                        <td className="px-6 py-6 font-medium group/customer">
                                            <div className="flex items-center gap-3">
                                                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-white flex items-center justify-center text-xs  text-slate-500 shrink-0 shadow-sm transition-transform group-hover/customer:scale-110">
                                                    {w.customerName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="text-slate-900 font-bold text-base group-hover/customer:text-primary transition-colors">{w.customerName}</div>
                                                    <div className="text-xs text-slate-500 font-bold tracking-wider mt-0.5">{w.customerPhone}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Device */}
                                        <td className="px-8 py-6 font-medium">
                                            <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-white transition-all hover:shadow-sm group/device">
                                                <div className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display group-hover/device:text-primary transition-colors">
                                                    <Smartphone className="h-4 w-4 text-primary/70" />
                                                    {w.deviceModel}
                                                </div>
                                                <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 bg-white text-slate-500 rounded-lg w-fit border border-slate-200">
                                                    {w.repairType}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Revenue */}
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-bold text-slate-400 leading-none mb-2 tracking-widest font-display uppercase">CERT VALUE</span>
                                                <div className="font-mono font-bold text-slate-900 text-xl font-display">
                                                    ₹{(w.repairCost || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col" suppressHydrationWarning>
                                                <span className="text-[9px]  text-slate-400 leading-none mb-1">VALID TILL</span>
                                                <div className="text-sm  text-slate-700 flex items-center gap-2">
                                                    <Clock className="h-3 w-3 text-slate-400" />
                                                    <span suppressHydrationWarning>
                                                        {w.expiresAt ? (() => {
                                                            const date = new Date(w.expiresAt);
                                                            const day = date.getDate().toString().padStart(2, '0');
                                                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                                            return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
                                                        })() : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 leading-none mb-2 tracking-widest font-display uppercase">LIVE STATE</span>
                                                <StatusBadge status={w.status} expiresAt={w.expiresAt} />
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-3 transition-all duration-500">
                                                <ActionMenu warranty={w} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{filteredWarranties.length} Records</span>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    sub,
    highlight,
    secure,
    isVisible,
    onToggle,
    icon: Icon
}: {
    title: string,
    value: string,
    sub: string,
    highlight?: boolean,
    secure?: boolean,
    isVisible?: boolean,
    onToggle?: () => void,
    icon?: any
}) {
    return (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -z-0 group-hover:bg-primary/10 transition-colors" />

            <div className="mb-4 flex items-start justify-between relative z-10">
                <div className="p-3.5 bg-slate-50 text-slate-500 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm border border-slate-200 group-hover:border-primary">
                    {Icon ? <Icon className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                </div>
                {secure && onToggle && (
                    <button
                        onClick={onToggle}
                        className="text-slate-400 hover:text-primary transition-colors focus:outline-none p-2 bg-slate-50 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 shadow-sm"
                    >
                        {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-xs font-bold text-slate-500 mb-1.5 tracking-widest font-display uppercase">{title}</h3>
                <div className={cn("text-3xl font-bold mb-2.5 tracking-tight font-display", highlight ? "text-primary" : "text-slate-900")}>
                    {secure && !isVisible ? "••••••" : value}
                </div>
                <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 tracking-wider font-display w-fit">{sub}</div>
            </div>
        </div>
    );
}

function StatusBadge({ status, expiresAt }: { status: string, expiresAt: Date }) {
    const isExpired = new Date(expiresAt) < new Date();

    // Derived status for display
    let displayStatus = status;
    if (status === 'ACTIVE' && isExpired) displayStatus = 'EXPIRED';

    const styles: Record<string, string> = {
        'ACTIVE': "bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm",
        'EXPIRED': "bg-slate-100 text-slate-500 border border-slate-200",
        'CLAIMED': "bg-orange-100 text-orange-800 border border-orange-200 shadow-sm",
        'VOID': "bg-red-100 text-red-800 border border-red-200"
    };

    const icons: Record<string, any> = {
        'ACTIVE': CheckCircle,
        'EXPIRED': Clock,
        'CLAIMED': ShieldCheck,
        'VOID': X
    };

    const StatusIcon = icons[displayStatus] || Clock;

    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide",
            styles[displayStatus] || styles['EXPIRED']
        )}>
            <StatusIcon className="h-3 w-3 mr-1.5" strokeWidth={2.5} />
            {displayStatus}
        </span>
    );
}

function ActionMenu({ warranty }: { warranty: Warranty }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpdate = async (status: string) => {
        setLoading(true);
        await updateWarrantyStatus(warranty.id, status);
        setLoading(false);
        setIsOpen(false);
        router.refresh();
    };

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-secondary rounded-full transition-colors relative z-0"
            >
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 animate-fade-in">
                        <div className="py-1">
                            <div className="px-4 py-2 text-xs font-bold text-gray-400">Update Status</div>
                            {['ACTIVE', 'CLAIMED', 'VOID', 'EXPIRED'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleUpdate(s)}
                                    disabled={loading}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    Mark as {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
