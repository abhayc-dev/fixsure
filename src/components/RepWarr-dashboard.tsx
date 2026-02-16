"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ShieldCheck,
    Plus,
    Search,
    MoreHorizontal,
    MoreVertical,
    Calendar,
    Smartphone,
    CheckCircle,
    Clock,
    LogOut,
    X,
    Loader2,
    ArrowRight,
    Lock,
    XCircle,
    Settings,
    Eye,
    EyeOff,
    Wrench,
    Filter,
    MessageCircle,
    Printer,
    DollarSign,
    Inbox,
    Activity,
    Truck,
    ChevronDown,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createWarranty, verifyAccessPin, setAccessPin, createJobSheet } from "@/lib/actions";
import { logout } from "@/lib/auth-actions";
import ProfileForm from "./settings/profile-form";
import SecurityForm from "./settings/security-form";
import CreateWarrantyForm from "./create-warranty-form";
import CreateJobSheetForm from "./create-job-sheet-form";
import JobDetailsView from "./job-details-view";
import JobCustomerView from "./job-customer-view";
import WarrantyCardView from "./warranty-card-view";
import WarrantyDetailsView from "./warranty-details-view";
import { DashCircularChart, DashRevenueChart } from "./dash-charts";

type Warranty = {
    id: string;
    shortCode: string; // The FS-Number
    customerName: string;
    customerPhone: string;
    deviceModel: string;
    repairType: string;
    repairCost: number | null;
    durationDays: number;
    issuedAt: Date;
    expiresAt: Date;
    status: string;
    privateNote?: string | null;
};

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

type Stats = {
    total: number;
    active: number;
    revenue: number;
    monthlyRevenue: number;
    weeklyChart: { label: string, value: number }[];
    monthlyChart: { label: string, value: number }[];
    jobChart: { label: string, value: number }[];
    jobDistribution: { label: string, value: number, color: string }[];
    shopName: string;
    subscription: string;
    isVerified: boolean;
    hasAccessPin: boolean;
}

type Shop = {
    id: string;
    shopName: string;
    ownerName: string | null;
    address: string | null;
    city: string | null;
    phone: string;
    accessPin: string | null;
    companyLogoUrl?: string | null;
}

export default function DashboardClient({
    initialWarranties,
    initialJobSheets = [],
    stats,
    shop
}: {
    initialWarranties: Warranty[],
    initialJobSheets?: JobSheet[],
    stats: Stats,
    shop: any
}) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJobSheetModal, setShowJobSheetModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [viewMode, setViewMode] = useState<'WARRANTIES' | 'JOBS' | 'REPORTS' | 'SETTINGS' | 'CREATE_WARRANTY' | 'CREATE_JOB' | 'JOB_DETAILS' | 'JOB_CUSTOMER_DETAILS' | 'WARRANTY_DETAILS' | 'WARRANTY_CERTIFICATE'>('JOBS');

    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);

    const [isRevenueVisible, setIsRevenueVisible] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [pinMode, setPinMode] = useState<'SET' | 'VERIFY'>('VERIFY');

    const handleRevenueToggle = () => {
        if (isRevenueVisible) {
            setIsRevenueVisible(false);
            return;
        }

        if (!stats.hasAccessPin) {
            setPinMode('SET');
            setShowPinModal(true);
        } else {
            setPinMode('VERIFY');
            setShowPinModal(true);
        }
    };

    const handlePinSuccess = () => {
        setIsRevenueVisible(true);
        setShowPinModal(false);
    };

    const handleViewJob = (job: JobSheet) => {
        setSelectedJobId(job.id);
        setViewMode('JOB_DETAILS');
    };

    const handleViewWarranty = (warranty: Warranty) => {
        setSelectedWarranty(warranty);
        setViewMode('WARRANTY_DETAILS'); // Open User Details View instead of Card
    };

    const handleOpenCertificate = () => {
        setViewMode('WARRANTY_CERTIFICATE');
    };

    const handleBackToDetails = () => {
        setViewMode('WARRANTY_DETAILS');
    };

    const isPlanActive = stats.subscription === 'ACTIVE' || stats.subscription === 'FREE_TRIAL';

    const filteredWarranties = initialWarranties.filter(w =>
        w.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.customerPhone.includes(searchTerm) ||
        w.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredJobSheets = (initialJobSheets || []).filter(j =>
        (statusFilter === 'ALL' || j.status === statusFilter) &&
        (j.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            j.customerPhone.includes(searchTerm) ||
            j.jobId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const selectedJobSheet = initialJobSheets.find(j => j.id === selectedJobId) || null;

    // RENDER LOGIC


    if (viewMode === 'WARRANTY_DETAILS' && selectedWarranty) {
        return (
            <div className="min-h-screen bg-[#f3f4f6] p-4">
                <WarrantyDetailsView
                    warranty={selectedWarranty}
                    onBack={() => {
                        setSelectedWarranty(null);
                        setViewMode('WARRANTIES');
                    }}
                    onOpenCard={() => setViewMode('WARRANTY_CERTIFICATE')}
                />
            </div>
        );
    }

    if (viewMode === 'WARRANTY_CERTIFICATE' && selectedWarranty) {
        return (
            <div className="min-h-screen bg-[#f3f4f6] p-4">
                <WarrantyCardView warranty={selectedWarranty} shop={shop} onBack={handleBackToDetails} />
            </div>
        );
    }

    if (viewMode === 'JOB_DETAILS' && selectedJobSheet) {
        return (
            <div className="min-h-screen bg-white">
                <JobDetailsView job={selectedJobSheet} shop={shop} onBack={() => {
                    setSelectedJobId(null);
                    setViewMode('JOBS');
                }} />
            </div>
        );
    }

    if (viewMode === 'JOB_CUSTOMER_DETAILS' && selectedJobSheet) {
        return (
            <div className="min-h-screen bg-[#f3f4f6] p-4">
                <JobCustomerView job={selectedJobSheet} shop={shop} onBack={() => {
                    setSelectedJobId(null);
                    setViewMode('JOBS');
                }} onInvoice={() => setViewMode('JOB_DETAILS')} />
            </div>
        );
    }



    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-[#0F172A] text-white flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-slate-800/50 relative overflow-hidden">
                {/* Subtle Glow Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[80px] -z-0 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[80px] -z-0 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                    {/* Brand */}
                    <div className="h-24 flex items-center px-8 mb-4">
                        <Link href="/" className="flex items-center gap-3 group transition-all">
                            <div className="p-2.5 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-all border border-primary/20 shadow-lg shadow-primary/5 overflow-hidden relative">
                                {shop.companyLogoUrl ? (
                                    <img src={shop.companyLogoUrl} alt="Logo" className="h-7 w-7 object-contain" />
                                ) : (
                                    <ShieldCheck className="h-7 w-7 text-primary" />
                                )}
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-primary transition-colors font-display">FixSure</span>
                        </Link>
                    </div>

                    {/* Nav Items */}
                    <nav className="px-4 space-y-1.5">


                        <div className="px-4 mb-3">
                            <p className="text-xs font-bold text-slate-500 tracking-widest ml-1 opacity-70 uppercase">Management</p>
                        </div>

                        {[
                            { id: 'JOBS', icon: Wrench, label: 'Repair Jobs' },
                            { id: 'WARRANTIES', icon: CheckCircle, label: 'Warranties' },
                            { id: 'REPORTS', icon: Activity, label: 'Reports' },
                            { id: 'SETTINGS', icon: Settings, label: 'Settings' }
                        ].map((item) => {
                            const Icon = item.icon;
                            const isActive = viewMode === item.id || (item.id === 'JOBS' && viewMode === 'JOB_DETAILS') || (item.id === 'WARRANTIES' && viewMode === 'WARRANTY_DETAILS');

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setViewMode(item.id as any)}
                                    className={cn(
                                        "flex items-center gap-3.5 w-full px-5 py-4 rounded-2xl text-sm font-bold transition-all group",
                                        isActive
                                            ? "bg-gradient-to-r from-primary/15 to-transparent text-primary border-l-4 border-primary rounded-l-none"
                                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary" : "group-hover:text-primary")} />
                                    <span className="font-display tracking-wide">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 relative z-10">
                    {/* User Profile Mini */}
                    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 mb-4 group hover:bg-slate-800/60 transition-all cursor-default">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-[#FF8E72] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                {(shop.ownerName || shop.shopName || "SO").substring(0, 2).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <div className="font-bold truncate text-sm text-white leading-tight">
                                    {shop.ownerName || "Shop Owner"}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate tracking-wider mt-0.5">
                                    {shop.shopName}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                            <div className={cn("text-[10px] flex items-center gap-1.5 font-bold tracking-widest uppercase", isPlanActive ? "text-emerald-400" : "text-rose-400")}>
                                <div className={cn("w-2 h-2 rounded-full", isPlanActive ? "bg-emerald-400 animate-pulse" : "bg-rose-400")} />
                                {stats.subscription.replace('_', ' ')}
                            </div>
                            <button onClick={() => setShowLogoutConfirm(true)} className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors" title="Logout">
                                <LogOut className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>


            {/* Main Content Area */}
            <main className="flex-1 overflow-auto flex flex-col relative">
                {/* Header Overlay Gradient (desktop only) */}
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-0" />

                {/* Top Header Mobile / Desktop Title */}
                {/* Elite Header */}
                <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 flex items-center px-6 md:px-10">
                    {/* Title Section */}
                    <div className="flex items-center gap-5 flex-none py-4">
                        <div className="w-1.5 h-10 bg-primary rounded-full shrink-0 shadow-[0_0_15px_rgba(255,100,66,0.25)]" />
                        <div className="flex flex-col flex-none">
                            <h1 className="text-2xl md:text-3xl  text-slate-900 font-display whitespace-nowrap leading-none tracking-tight">
                                {viewMode === 'WARRANTIES' && "Warranty Data"}
                                {viewMode === 'JOBS' && "Repair Data"}
                                {viewMode === 'REPORTS' && "Insight Hub"}
                                {viewMode === 'SETTINGS' && "Control Center"}
                                {viewMode === 'CREATE_WARRANTY' && "New Warranty"}
                                {viewMode === 'CREATE_JOB' && "New Job Sheet"}
                            </h1>
                            <p className="text-xs font-bold text-slate-400 tracking-widest mt-2 whitespace-nowrap opacity-60 uppercase">
                                FixSure Control Systems v2.0
                            </p>
                        </div>
                    </div>

                    {/* Elastic Spacer */}
                    <div className="flex-1 min-w-[2rem]" />

                    {/* Actions Section */}
                    <div className="flex items-center gap-6 flex-none pr-2">
                        {viewMode === 'JOBS' && (
                            <button
                                onClick={() => setViewMode('CREATE_JOB')}
                                disabled={!isPlanActive || !stats.isVerified}
                                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Wrench className="h-4 w-4" />
                                <span>Repair Entry</span>
                            </button>
                        )}

                        {viewMode === 'WARRANTIES' && (
                            <button
                                onClick={() => setViewMode('CREATE_WARRANTY')}
                                disabled={!isPlanActive || !stats.isVerified}
                                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Warranty</span>
                            </button>
                        )}
                    </div>



                </header>


                <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 md:space-y-8">

                    {/* Blocked / Expired Banners */}
                    {!stats.isVerified && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
                            <Lock className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-bold text-red-800">Account Restricted</h3>
                                <p className="text-sm text-red-600">Contact admin to restore access.</p>
                            </div>
                        </div>
                    )}

                    {!isPlanActive && (
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-orange-600" />
                                <div>
                                    <h3 className="text-sm font-bold text-orange-800">Plan Expired</h3>
                                    <p className="text-sm text-orange-600">Recharge to continue services.</p>
                                </div>
                            </div>
                            <Link href="/dashboard/subscription" className="text-sm font-bold text-orange-700 underline">Recharge Now</Link>
                        </div>
                    )}

                    {/* Dynamic Content based on View Mode */}

                    {viewMode === 'CREATE_WARRANTY' ? (
                        <CreateWarrantyForm onSuccess={() => setViewMode('WARRANTIES')} />
                    ) : viewMode === 'CREATE_JOB' ? (
                        <CreateJobSheetForm onSuccess={() => setViewMode('JOBS')} shopCategory={shop.category} />
                    ) : viewMode === 'JOB_DETAILS' && selectedJobSheet ? (
                        <JobDetailsView job={selectedJobSheet} shop={shop} onBack={() => setViewMode('JOBS')} />
                    ) : viewMode === 'SETTINGS' ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fade-in">
                            {/* Left Pane: Shop Profile */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">Shop Profile</h2>
                                        <p className="text-sm text-slate-400">Visible on customer receipts</p>
                                    </div>
                                </div>
                                <div className="pt-2 text-black">
                                    <ProfileForm shop={shop} />
                                </div>
                            </div>

                            {/* Right Pane: Security */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 h-fit">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                                        <Lock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">Security Access</h2>
                                        <p className="text-sm text-slate-400">Control sensitive data visibility</p>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <SecurityForm hasPin={!!shop.accessPin} />
                                </div>
                            </div>
                        </div>
                    ) : viewMode === 'REPORTS' ? (
                        <div className="space-y-8 animate-fade-in pb-20">
                            {/* Premium Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <ReportStatCard
                                    label="Total Issuance"
                                    value={stats.total}
                                    icon={ShieldCheck}
                                    color="blue"
                                />
                                <ReportStatCard
                                    label="Active Assets"
                                    value={stats.active}
                                    icon={CheckCircle}
                                    color="emerald"
                                />
                                <ReportStatCard
                                    label="Monthly Yield"
                                    value={stats.monthlyRevenue}
                                    icon={Activity}
                                    color="purple"
                                    isRevenue
                                    isVisible={isRevenueVisible}
                                    onToggle={handleRevenueToggle}
                                />
                                <ReportStatCard
                                    label="Annual Volume"
                                    value={stats.revenue}
                                    icon={DollarSign}
                                    color="orange"
                                    isRevenue
                                    isVisible={isRevenueVisible}
                                    onToggle={handleRevenueToggle}
                                />
                            </div>

                            {/* Main Analysis Block */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left: Analytics Chart */}
                                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-xl  text-slate-900 leading-none">Revenue Growth</h3>
                                            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-2">Fiscal Performance 2024</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Period Switches would go here */}
                                        </div>
                                    </div>
                                    <div className="h-[300px] w-full">
                                        <DashRevenueChart data={stats.monthlyChart} isVisible={isRevenueVisible} />
                                    </div>
                                </div>

                                {/* Right: Distribution Analysis */}
                                <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-200 overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-0" />

                                    <div className="relative z-10">
                                        <h3 className="text-lg  leading-none mb-1">Job Matrix</h3>
                                        <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] mb-8">System Distribution</p>

                                        <div className="flex justify-center py-4">
                                            <DashCircularChart data={stats.jobDistribution || []} />
                                        </div>

                                        <div className="mt-8 space-y-4">
                                            {(stats.jobDistribution || []).map((item, idx) => {
                                                const totalInDistribution = stats.jobDistribution.reduce((acc, curr) => acc + curr.value, 0);
                                                const percentage = totalInDistribution > 0 ? Math.round((item.value / totalInDistribution) * 100) : 0;

                                                return (
                                                    <div key={idx} className="flex items-center justify-between group/item">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] transition-transform group-hover/item:scale-125" style={{ backgroundColor: item.color }} />
                                                            <span className="text-[10px]  text-slate-400 tracking-[0.15em] transition-colors group-hover/item:text-slate-200">{item.label}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-xs  text-slate-500">{item.value}</span>
                                                            <span className="text-sm  text-white w-10 text-right">{percentage}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : viewMode === 'WARRANTIES' ? (
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
                                    onToggle={handleRevenueToggle}
                                    icon={DollarSign}
                                />
                            </div>

                            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex flex-col overflow-hidden animate-slide-up">
                                {/* Enhanced Control Bar */}
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
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <button className="h-14 px-8 rounded-[1.25rem] bg-white text-slate-600  hover:bg-slate-50 transition-all flex items-center gap-3 text-xs border border-slate-200 active:scale-95 tracking-[0.2em] font-display shadow-sm">
                                            <Filter className="h-4 w-4 text-primary" /> Filter
                                        </button>
                                    </div>
                                </div>

                                {/* Premium Table */}
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
                                                        onClick={() => {
                                                            setSelectedWarranty(w);
                                                            setViewMode('WARRANTY_CERTIFICATE');
                                                        }}
                                                        className="hover:bg-slate-100/60 hover:shadow-sm transition-all group cursor-pointer"
                                                    >
                                                        {/* ID */}
                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-primary/70 leading-none mb-1.5 uppercase tracking-wider">ID CODE</span>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedWarranty(w);
                                                                        setViewMode('WARRANTY_CERTIFICATE');
                                                                    }}
                                                                    className="text-base font-bold text-slate-900 font-mono hover:text-primary transition-colors cursor-pointer"
                                                                >
                                                                    {w.shortCode}
                                                                </button>
                                                            </div>
                                                        </td>

                                                        {/* Customer */}
                                                        <td
                                                            className="px-6 py-6 font-medium cursor-pointer group/customer"
                                                            onClick={() => {
                                                                setSelectedWarranty(w);
                                                                setViewMode('WARRANTY_CERTIFICATE');
                                                            }}
                                                        >
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
                                                        <td
                                                            className="px-8 py-6 font-medium cursor-pointer"
                                                            onClick={() => {
                                                                setSelectedWarranty(w);
                                                                setViewMode('WARRANTY_CERTIFICATE');
                                                            }}
                                                        >
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
                                <div className="p-6 bg-slate-50 border-t border-slate-200 text-center">
                                    <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Vault is encrypted and secure</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in ">
                            {/* Stats Summary for Jobs */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <JobSummaryCard title="In Intake" count={filteredJobSheets.filter(j => j.status === 'RECEIVED').length} color="blue" />
                                <JobSummaryCard title="Under Repair" count={filteredJobSheets.filter(j => j.status === 'IN_PROGRESS').length} color="amber" />
                                <JobSummaryCard title="Ready to Go" count={filteredJobSheets.filter(j => j.status === 'READY').length} color="emerald" />
                                <JobSummaryCard title="Delivered" count={filteredJobSheets.filter(j => j.status === 'DELIVERED').length} color="slate" />
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
                                                    <td colSpan={8} className="py-32 text-center">
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
                                                        onClick={() => {
                                                            setSelectedJobId(j.id);
                                                            setViewMode('JOB_CUSTOMER_DETAILS');
                                                        }}
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
                                                        <td
                                                            className="px-6 py-4 cursor-pointer group/cell"
                                                            onClick={() => {
                                                                setSelectedJobId(j.id);
                                                                setViewMode('JOB_CUSTOMER_DETAILS');
                                                            }}
                                                        >
                                                            <div className="flex flex-col gap-0.5">
                                                                <div className="text-slate-900 font-bold text-base group-hover/cell:text-primary transition-colors">{j.customerName}</div>
                                                                <div className="text-xs text-slate-500 font-bold tracking-wider mt-0.5">{j.customerPhone}</div>
                                                            </div>
                                                        </td>
                                                        <td
                                                            className="px-6 py-4 text-slate-900 font-bold text-sm cursor-pointer hover:text-primary transition-colors"
                                                            onClick={() => {
                                                                setSelectedJobId(j.id);
                                                                setViewMode('JOB_CUSTOMER_DETAILS');
                                                            }}
                                                        >
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
                                                            <EditableJobStatus job={j} />
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
                    )}
                </div>
            </main >

            {/* Modals from before */}
            {showCreateModal && <CreateModal onClose={() => setShowCreateModal(false)} />}
            {showJobSheetModal && <JobSheetModal onClose={() => setShowJobSheetModal(false)} />}

            {/* Pin & Logout Modals... */}
            {showPinModal && <PinModal onClose={() => setShowPinModal(false)} onSuccess={handlePinSuccess} mode={pinMode} />}

            {
                showLogoutConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-xl font-bold mb-2 text-gray-900">Logout?</h2>
                            <p className="text-gray-500 mb-6">Are you sure you want to log out?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 font-medium hover:bg-gray-50 text-gray-700">Cancel</button>
                                <button onClick={() => logout()} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700">Logout</button>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
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

import { updateWarrantyStatus, updateJobStatus } from "@/lib/actions";
import { generateJobBill } from "@/lib/print-utils";

function ActionMenu({ warranty }: { warranty: Warranty }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (status: string) => {
        setLoading(true);
        await updateWarrantyStatus(warranty.id, status);
        setLoading(false);
        setIsOpen(false);
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

function JobActionMenu({ job, shop }: { job: JobSheet, shop: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (status: string) => {
        setLoading(true);
        await updateJobStatus(job.id, status);
        setLoading(false);
        setIsOpen(false);
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

function PinModal({
    onClose,
    onSuccess,
    mode
}: {
    onClose: () => void,
    onSuccess: () => void,
    mode: 'SET' | 'VERIFY'
}) {
    const [pin, setPin] = useState(["", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInput = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        // Auto focus next
        if (value && index < 3) {
            const nextInput = document.getElementById(`pin-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            const prevInput = document.getElementById(`pin-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullPin = pin.join("");
        if (fullPin.length !== 4) {
            setError("Please enter a 4-digit PIN");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (mode === 'SET') {
                const res = await setAccessPin(fullPin);
                if (!res.success) throw new Error(res.error);
            } else {
                const res = await verifyAccessPin(fullPin);
                if (!res.success) throw new Error(res.error);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed");
            setPin(["", "", "", ""]);
            document.getElementById('pin-0')?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border animate-scale-in p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-primary">
                        {mode === 'SET' ? "Set Security PIN" : "Enter Security PIN"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full hover:text-red-500 cursor-pointer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center text-sm text-muted-foreground">
                        {mode === 'SET'
                            ? "Create a 4-digit PIN to hide your revenue from others."
                            : "Enter your PIN to view hidden revenue details."
                        }
                    </div>

                    <div className="flex justify-center gap-4">
                        {pin.map((digit, i) => (
                            <input
                                key={i}
                                id={`pin-${i}`}
                                type="password"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleInput(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className="w-12 h-14 text-center text-2xl font-bold rounded-lg border border-input bg-gray-400 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="text-xs text-destructive text-center font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || pin.some(p => !p)}
                        className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {mode === 'SET' ? "Set PIN" : "Verify PIN"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function CreateModal({ onClose }: { onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);
        try {
            await createWarranty(formData);
            onClose();
        } catch (e: any) {
            setError(e.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border animate-slide-up">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-bold">Issue New Warranty</h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form action={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                            <XCircle className="h-4 w-4" /> {error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Customer Name</label>
                            <input
                                name="customer"
                                required
                                className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mobile Number</label>
                            <input
                                name="phone"
                                required
                                type="tel"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                                maxLength={10}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Customer Address</label>
                        <input
                            name="address"
                            className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                            placeholder="e.g. Sector 62, Noida"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Device Model</label>
                        <input
                            name="device"
                            required
                            className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                            placeholder="e.g. iPhone 13, Samsung AC 1.5T"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Repair Description</label>
                            <input
                                name="issue"
                                required
                                className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                                placeholder="e.g. Screen"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Repair Cost (₹)</label>
                            <input
                                name="price"
                                type="number"
                                min="0"
                                step="10"
                                required
                                placeholder="e.g. 1500"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Warranty Period</label>
                        <select
                            name="duration"
                            className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                            defaultValue="30"
                        >
                            <option value="15">15 Days</option>
                            <option value="30">30 Days (Standard)</option>
                            <option value="90">3 Months</option>
                            <option value="180">6 Months</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 h-10 rounded-lg border border-border font-medium hover:bg-secondary transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Generate & Send SMS"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function JobSheetModal({ onClose }: { onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);
        try {
            await createJobSheet(formData);
            onClose();
            // In a real app we might show a success toast here
        } catch (e: any) {
            setError(e.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border animate-slide-up max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Wrench className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">New Repair Job Sheet</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form action={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                            <XCircle className="h-4 w-4" /> {error}
                        </div>
                    )}

                    {/* Customer Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-muted-foreground tracking-wider flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-border"></span> Customer Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Customer Name</label>
                                <input
                                    name="customerName"
                                    required
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mobile Number</label>
                                <input
                                    name="customerPhone"
                                    required
                                    type="tel"
                                    maxLength={10}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Address</label>
                            <input
                                name="customerAddress"
                                placeholder="e.g. Colony, City"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Device Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-muted-foreground tracking-wider flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-border"></span> Device Info
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Device Type</label>
                                <select
                                    name="deviceType"
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
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
                                <label className="text-sm font-medium">Brand & Model</label>
                                <input
                                    name="deviceModel"
                                    required
                                    placeholder="e.g. Samsung S23 Ultra"
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Problem Description</label>
                            <textarea
                                name="problemDesc"
                                required
                                rows={3}
                                placeholder="Describe the issue (e.g. Display broken, Not cooling, etc.)"
                                className="w-full p-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Accessories Received</label>
                            <input
                                name="accessories"
                                placeholder="e.g. Adapter, Remote, Cover (Optional)"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Dates & Cost */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-muted-foreground tracking-wider flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-border"></span> Service Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Est. Completion Date</label>
                                <input
                                    name="expectedAt"
                                    type="date"
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estimated Cost (₹)</label>
                                <input
                                    name="estimatedCost"
                                    type="number"
                                    min="0"
                                    placeholder="0.00"
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Advance Paid (₹)</label>
                                <input
                                    name="advanceAmount"
                                    type="number"
                                    min="0"
                                    placeholder="0.00"
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 sticky bottom-0 bg-card pb-2 border-t border-border mt-4">
                        <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl border border-border font-medium hover:bg-secondary transition-colors text-muted-foreground text-sm tracking-wide">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-sm tracking-wide"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                <>
                                    <span>Create Job Sheet</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
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
            "px-3 py-1.5 rounded-2xl text-[10px]  tracking-widest inline-flex items-center gap-2 border shadow-sm",
            c.bg, c.text, c.border
        )}>
            <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]", c.dot)} />
            {status.replace('_', ' ')}
        </span>
    );
}

function ReportStatCard({ label, value, icon: Icon, color, isRevenue, isVisible, onToggle }: any) {
    const colorStyles: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100"
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-xl border transition-colors shadow-sm", colorStyles[color])}>
                    <Icon className="h-5 w-5" />
                </div>
                {isRevenue && (
                    <button
                        onClick={onToggle}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors border border-transparent hover:border-slate-200 outline-none"
                    >
                        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                )}
            </div>
            <div>
                <p className="text-[10px]  text-slate-400 tracking-[0.15em] mb-1 font-display opacity-80 uppercase">{label}</p>
                <h3 className="text-2xl  text-slate-900 font-display tracking-tight">
                    {isRevenue && !isVisible ? '••••••' : (isRevenue ? `₹${value.toLocaleString()}` : value.toLocaleString())}
                </h3>
            </div>
        </div>
    );
}



function EditableJobStatus({ job }: { job: JobSheet }) {
    const [loading, setLoading] = useState(false);

    const statuses = ['RECEIVED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'];

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === job.status) return;
        setLoading(true);
        try {
            await updateJobStatus(job.id, newStatus);
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setLoading(false);
        }
    };

    const config: Record<string, { bg: string, border: string, text: string, dot: string }> = {
        'RECEIVED': { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
        'IN_PROGRESS': { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", dot: "bg-amber-500 animate-pulse" },
        'READY': { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
        'DELIVERED': { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600", dot: "bg-slate-400" },
        'CANCELLED': { bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-700", dot: "bg-rose-500" }
    };

    const c = config[job.status] || config['RECEIVED'];

    return (
        <div className="relative group/status" onClick={(e) => e.stopPropagation()}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-2xl">
                    <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                </div>
            )}
            <select
                value={job.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={loading}
                className={cn(
                    "appearance-none pl-7 pr-4 py-1.5 rounded-2xl text-[10px]  tracking-widest inline-flex items-center gap-2 border shadow-sm cursor-pointer outline-none transition-all hover:ring-2 hover:ring-primary/10",
                    c.bg, c.text, c.border,
                    loading && "opacity-50"
                )}
            >
                {statuses.map(s => (
                    <option key={s} value={s} className="bg-white text-slate-900 font-bold py-2">
                        {s.replace('_', ' ')}
                    </option>
                ))}
            </select>
            <div className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none",
                c.dot
            )} />
        </div>
    );
}
