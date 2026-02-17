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
    Loader2,
    Printer,
    ChevronDown,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateJobStatus } from "@/lib/actions";
import { generateJobBill } from "@/lib/print-utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
    technicalDetails?: any;
};

type Shop = {
    shopName: string | null;
    address: string | null;
    city: string | null;
    phone: string;
    gstNumber?: string | null;
};

export default function JobListView({ initialJobSheets, shop }: { initialJobSheets: JobSheet[], shop: Shop }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Client-side filtering with date range
    const filteredJobSheets = initialJobSheets.filter(j => {
        // Status filter
        const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;

        // Search filter
        const matchesSearch = j.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            j.customerPhone.includes(searchTerm) ||
            j.jobId.toLowerCase().includes(searchTerm.toLowerCase());

        // Date range filter
        let matchesDateRange = true;
        if (startDate && endDate && j.expectedAt) {
            const jobDate = new Date(j.expectedAt);
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            matchesDateRange = jobDate >= start && jobDate <= end;
        } else if (startDate && j.expectedAt) {
            const jobDate = new Date(j.expectedAt);
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            matchesDateRange = jobDate >= start;
        }

        return matchesStatus && matchesSearch && matchesDateRange;
    });

    const clearDateRange = () => {
        setStartDate(null);
        setEndDate(null);
    };

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

                    <div className="flex gap-3 w-full lg:w-auto items-center flex-wrap">
                        {/* Status Filter Dropdown */}
                        <StatusFilterDropdown
                            currentFilter={statusFilter}
                            onFilterChange={setStatusFilter}
                        />

                        {/* Date Range Picker */}
                        <DateRangeFilter
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={setStartDate}
                            onEndDateChange={setEndDate}
                            onClear={clearDateRange}
                        />
                        <div className="relative flex-1 group w-full">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                <Search className="h-5 w-5" />
                            </div>
                            <input
                                placeholder="Find job by name, device, or repair ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-12 pl-14 pr-6 rounded-[1.25rem] bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-base font-normal text-slate-700 placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto h-100">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/60 text-xs font-bold text-slate-500 tracking-widest border-b border-slate-200 font-display uppercase">
                                <th className="px-6 py-5">Sequence</th>
                                <th className="px-6 py-5">Client Profile</th>
                                <th className="px-6 py-5">Machine Class</th>
                                <th className="px-6 py-4">Schedule</th>
                                <th className="px-6 py-4">Valuation</th>
                                <th className="px-6 py-4 text-right">Current State</th>
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
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-500 tracking-widest mb-1 uppercase">QUOTE</span>
                                                <div className="text-slate-900 font-bold text-lg font-mono">
                                                    {j.estimatedCost ? `₹${j.estimatedCost.toLocaleString()}` : '---'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <JobStatusDropdown job={j} shop={shop} />
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

function StatusFilterDropdown({ currentFilter, onFilterChange }: { currentFilter: string, onFilterChange: (filter: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);

    const filters = [
        { value: 'ALL', label: 'All', color: 'slate' },
        { value: 'RECEIVED', label: 'Received', color: 'blue' },
        { value: 'IN_PROGRESS', label: 'In Progress', color: 'amber' },
        { value: 'READY', label: 'Ready', color: 'emerald' },
        { value: 'DELIVERED', label: 'Delivered', color: 'slate' },
    ];

    const currentFilterObj = filters.find(f => f.value === currentFilter) || filters[0];

    const colorMap: Record<string, string> = {
        blue: "bg-blue-50 text-blue-700 border-blue-200",
        amber: "bg-amber-50 text-amber-700 border-amber-200",
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
        slate: "bg-slate-50 text-slate-700 border-slate-200"
    };

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-12 px-4 rounded-2xl text-xs font-bold tracking-wider whitespace-nowrap transition-all border shadow-sm flex items-center gap-2",
                    colorMap[currentFilterObj.color],
                    "hover:shadow-md active:scale-95"
                )}
            >
                Status: {currentFilterObj.label}
                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute left-0 mt-2 w-48 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-20 animate-fade-in overflow-hidden">
                        {filters.map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => {
                                    onFilterChange(filter.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2",
                                    currentFilter === filter.value && "bg-slate-50"
                                )}
                            >
                                <span className={cn(
                                    "px-2 py-1 rounded-lg text-xs",
                                    colorMap[filter.color]
                                )}>
                                    {filter.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function DateRangeFilter({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onClear
}: {
    startDate: Date | null,
    endDate: Date | null,
    onStartDateChange: (date: Date | null) => void,
    onEndDateChange: (date: Date | null) => void,
    onClear: () => void
}) {
    const hasDateRange = startDate || endDate;

    return (
        <div className="flex gap-2 items-center">
            <div className="flex gap-2 items-center bg-white rounded-2xl border border-slate-200 px-4 py-2 shadow-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => onStartDateChange(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    placeholderText="Start Date"
                    className="w-28 text-xs font-bold focus:outline-none text-slate-700"
                    dateFormat="dd MMM yyyy"
                />
                <span className="text-slate-400">-</span>
                <DatePicker
                    selected={endDate}
                    onChange={(date: Date | null) => onEndDateChange(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate ?? undefined}
                    placeholderText="End Date"
                    className="w-28 text-xs font-bold focus:outline-none text-slate-700"
                    dateFormat="dd MMM yyyy"
                />
            </div>

            {hasDateRange && (
                <button
                    onClick={onClear}
                    className="h-12 w-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all active:scale-95 border border-slate-200"
                    title="Clear date range"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

function JobStatusDropdown({ job, shop }: { job: JobSheet, shop: Shop }) {
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

    const statusConfig: Record<string, { bg: string, border: string, text: string, dot: string }> = {
        'RECEIVED': { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
        'IN_PROGRESS': { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", dot: "bg-amber-500 animate-pulse" },
        'READY': { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
        'DELIVERED': { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600", dot: "bg-slate-400" },
        'CANCELLED': { bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-700", dot: "bg-rose-500" }
    };

    const currentConfig = statusConfig[job.status] || statusConfig['RECEIVED'];

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "px-3 py-1.5 rounded-2xl text-[10px] font-bold tracking-widest inline-flex items-center gap-2 border shadow-sm transition-all hover:shadow-md active:scale-95 cursor-pointer",
                    currentConfig.bg, currentConfig.text, currentConfig.border
                )}
            >
                <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]", currentConfig.dot)} />
                {job.status.replace('_', ' ')}
                <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
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
                            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 tracking-wider">UPDATE STATUS</div>
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
                                        "block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors",
                                        job.status === s.value ? "text-blue-600 font-bold bg-blue-50/50" : "text-gray-700"
                                    )}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            {s.label}
                                        </span>
                                    ) : (
                                        s.label
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
