"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ShieldCheck,
    Plus,
    Search,
    MoreHorizontal,
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
    Printer
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
    const [viewMode, setViewMode] = useState<'WARRANTIES' | 'JOBS' | 'REPORTS' | 'SETTINGS' | 'CREATE_WARRANTY' | 'CREATE_JOB' | 'JOB_DETAILS' | 'JOB_CUSTOMER_DETAILS' | 'WARRANTY_DETAILS' | 'WARRANTY_CERTIFICATE'>('WARRANTIES');

    const [selectedJobSheet, setSelectedJobSheet] = useState<JobSheet | null>(null);
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
        setSelectedJobSheet(job);
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
                 <JobDetailsView job={selectedJobSheet} onBack={() => setViewMode('JOBS')} />
            </div>
        );
    }

    if (viewMode === 'JOB_CUSTOMER_DETAILS' && selectedJobSheet) {
        return (
            <div className="min-h-screen bg-[#f3f4f6] p-4">
                 <JobCustomerView job={selectedJobSheet} onBack={() => setViewMode('JOBS')} />
            </div>
        );
    }



    return (
        <div className="flex h-screen bg-[#f3f4f6]">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-[#1e293b] text-white flex-shrink-0 flex flex-col justify-between hidden md:flex">
                <div>
                    {/* Brand */}
                    <div className="h-16 flex items-center justify-center border-b border-white/10">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>

                    {/* Nav Items */}
                    <nav className="p-4 space-y-1">
                        <div className="space-y-4 mb-6">
                            <button
                                onClick={() => setViewMode('CREATE_WARRANTY')}
                                disabled={!isPlanActive || !stats.isVerified}
                                className={cn(
                                    "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20",
                                    (!isPlanActive || !stats.isVerified) && "opacity-50 cursor-not-allowed",
                                    viewMode === 'CREATE_WARRANTY' && "ring-2 ring-white ring-offset-2 ring-offset-[#1e293b]"
                                )}
                            >
                                <Plus className="h-5 w-5" />
                                New Warranty
                            </button>

                            <button
                                onClick={() => setViewMode('CREATE_JOB')}
                                disabled={!isPlanActive || !stats.isVerified}
                                className={cn(
                                    "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-bold bg-white text-primary border border-primary hover:bg-white/90 transition-all shadow-sm",
                                    (!isPlanActive || !stats.isVerified) && "opacity-50 cursor-not-allowed",
                                    viewMode === 'CREATE_JOB' && "ring-2 ring-primary ring-offset-2 ring-offset-[#1e293b]"
                                )}
                            >
                                <Wrench className="h-5 w-5" />
                                New Job Sheet
                            </button>
                        </div>

                        <button
                            onClick={() => setViewMode('WARRANTIES')}
                            className={cn(
                                "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                (viewMode === 'WARRANTIES' || viewMode === 'WARRANTY_DETAILS') ? "bg-white/10 text-white shadow-sm border border-white/5" : "text-slate-300 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <CheckCircle className="h-5 w-5" />
                            Warranties Data
                        </button>

                        <button
                            onClick={() => setViewMode('JOBS')}
                            className={cn(
                                "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                (viewMode === 'JOBS' || viewMode === 'JOB_DETAILS') ? "bg-white/10 text-white shadow-sm border border-white/5" : "text-slate-300 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <Wrench className="h-5 w-5" />
                            Repair Data
                        </button>

                        <button
                            onClick={() => setViewMode('REPORTS')}
                            className={cn(
                                "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                viewMode === 'REPORTS' ? "bg-white/10 text-white shadow-sm border border-white/5" : "text-slate-300 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <Calendar className="h-5 w-5" />
                            Reports & Stats
                        </button>

                        <button
                            onClick={() => setViewMode('SETTINGS')}
                            className={cn(
                                "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                viewMode === 'SETTINGS' ? "bg-white/10 text-white shadow-sm border border-white/5" : "text-slate-300 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <Settings className="h-5 w-5" />
                            Shop Settings
                        </button>
                    </nav>
                </div>

                <div className="p-4 border-t border-white/10">
                    {/* User Profile Mini */}
                    <div className="bg-white/5 rounded-lg p-3 mb-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {(shop.ownerName || shop.shopName || "SO").substring(0, 2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <div className="font-medium truncate text-sm text-white">
                                {shop.ownerName || "Shop Owner"}
                            </div>
                            <div className="text-xs text-slate-400 truncate">
                                {shop.shopName}
                            </div>

                            <div className={cn("text-[10px] flex items-center gap-1 mt-1 font-medium", isPlanActive ? "text-green-400" : "text-red-400")}>
                                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isPlanActive ? "bg-green-400" : "bg-red-400")}></span>
                                {stats.subscription.replace('_', ' ')}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center justify-center p-2 rounded-md hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-colors w-full" title="Logout">
                            <LogOut className="h-4 w-4 mr-2" /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto flex flex-col ">
                {/* Top Header Mobile / Desktop Title */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-40 p-5">
                    <div className="flex items-center gap-3 ">
                        {/* Mobile Menu Button - simplified (hidden for now as we focus on desktop layout refactor) */}
                        <div className="md:hidden">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 ">
                            {viewMode === 'WARRANTIES' && "Warranty Ledger"}
                            {/* Show 'Repair Job Sheets' even for DETAILS view so breadcrumb path feels correct or add sub-title */}
                            {(viewMode === 'JOBS' || viewMode === 'JOB_DETAILS') && "Repair Job Sheets"}
                            {viewMode === 'REPORTS' && "Business Reports"}
                            {viewMode === 'SETTINGS' && "Shop Management"}
                            {viewMode === 'CREATE_WARRANTY' && "New Warranty"}
                            {viewMode === 'CREATE_JOB' && "New Job Sheet"}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Global Actions - Removed 'New Job Sheet' since it's on the left now */}
                        {viewMode !== 'REPORTS' && viewMode !== 'SETTINGS' && viewMode !== 'CREATE_WARRANTY' && viewMode !== 'CREATE_JOB' && viewMode !== 'JOB_DETAILS' && (
                            <>
                                <button
                                    onClick={() => setViewMode('CREATE_WARRANTY')}
                                    disabled={!isPlanActive || !stats.isVerified}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium text-sm shadow-md shadow-primary/20",
                                        !isPlanActive && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <Plus className="h-4 w-4" /> New Warranty
                                </button>
                            </>
                        )}
                    </div>
                </header>

                <div className="p-6 max-w-7xl w-full mx-auto space-y-6">

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
                        <CreateJobSheetForm onSuccess={() => setViewMode('JOBS')} />
                    ) : viewMode === 'JOB_DETAILS' && selectedJobSheet ? (
                        <JobDetailsView job={selectedJobSheet} onBack={() => setViewMode('JOBS')} />
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
                                <div className="pt-2">
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
                        <div className="space-y-6 animate-fade-in">
                            {/* ... existing reports content ... */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-gray-800">Business Performance</h2>
                                    {!isRevenueVisible ? (
                                        <button
                                            onClick={handleRevenueToggle}
                                            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
                                        >
                                            <Eye className="h-4 w-4" /> Show Details
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleRevenueToggle}
                                            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                                        >
                                            <EyeOff className="h-4 w-4" /> Hide Details
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                                        <div className="text-sm text-blue-600 font-medium mb-1">Total Warranties</div>
                                        <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                                        <div className="text-sm text-green-600 font-medium mb-1">Active Warranties</div>
                                        <div className="text-2xl font-bold text-green-900">{stats.active}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100">
                                        <div className="text-sm text-purple-600 font-medium mb-1">Monthly Revenue</div>
                                        <div className="text-2xl font-bold text-purple-900">
                                            {isRevenueVisible ? `₹${stats.monthlyRevenue.toLocaleString()}` : '••••••'}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
                                        <div className="text-sm text-orange-600 font-medium mb-1">Total Revenue</div>
                                        <div className="text-2xl font-bold text-orange-900">
                                            {isRevenueVisible ? `₹${stats.revenue.toLocaleString()}` : '••••••'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left: Customer/Job Volume Trend (now Circular) */}
                                <div className="bg-red-100 p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col justify-center">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-6">Job Status Overview</h3>
                                    <DashCircularChart data={stats.jobDistribution || []} />
                                </div>

                                {/* Right: Revenue Trend */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <DashRevenueChart data={stats.monthlyChart} isVisible={isRevenueVisible} />
                                </div>
                            </div>
                        </div>
                    ) : viewMode === 'WARRANTIES' ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-12rem)]">
                            {/* Search Bar */}
                            <div className="p-4 border-b border-gray-100 flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        placeholder="Search by name, phone, or warranty ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm font-medium"
                                    />
                                </div>
                                <button className="h-10 px-4 rounded-xl bg-gray-50 text-gray-600 font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm border border-gray-100">
                                    <Filter className="h-4 w-4" /> Filter
                                </button>
                            </div>

                            {/* Table */}
                            <div className="flex-1 overflow-auto rounded-xl border border-slate-100 bg-white shadow-sm mt-5">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-slate-50/80 backdrop-blur-sm text-slate-500 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider sticky top-0 z-20">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Warranty ID</th>
                                            <th className="px-8 py-4 font-semibold">Customer</th>
                                            <th className="px-6 py-4 font-semibold">Device / Issue</th>
                                            <th className="px-6 py-4 text-right font-semibold">Amount</th>
                                            <th className="px-6 py-4 font-semibold">Expires</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                            <th className="px-8 py-4 text-right font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredWarranties.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-20 text-center text-slate-400">
                                                    <div className="flex flex-col items-center justify-center gap-3">
                                                        <Search className="h-10 w-10 opacity-20" />
                                                        <p>No warranties found.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredWarranties.map((w) => (
                                                <tr key={w.id} className="hover:bg-slate-50 transition-colors group">
                                                    {/* Warranty ID */}
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedWarranty(w);
                                                                setViewMode('WARRANTY_CERTIFICATE');
                                                            }}
                                                            className="font-mono text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10 hover:bg-primary/20 hover:scale-105 transition-all cursor-pointer"
                                                        >
                                                            {w.shortCode}
                                                        </button>
                                                    </td>

                                                    {/* Customer */}
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                                                                {w.customerName.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-slate-900 leading-tight">{w.customerName}</div>
                                                                <div className="text-xs text-slate-500 mt-0.5 font-medium">{w.customerPhone}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Device */}
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-start gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                                                                <Smartphone className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-slate-900 text-sm leading-tight">{w.deviceModel}</div>
                                                                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-1 bg-slate-50 inline-block px-1.5 py-0.5 rounded border border-slate-100">
                                                                    {w.repairType}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Amount */}
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="font-mono font-bold text-slate-700">
                                                            ₹{(w.repairCost || 0).toLocaleString()}
                                                        </div>
                                                    </td>

                                                    {/* Expires */}
                                                    <td className="px-6 py-5 whitespace-nowrap" suppressHydrationWarning>
                                                        <div className="flex items-center text-slate-700 font-bold text-xs group-hover:text-primary transition-colors">
                                                            <Clock className="h-3.5 w-3.5 mr-2 opacity-60" />
                                                            <span suppressHydrationWarning>
                                                                {w.expiresAt ? new Date(w.expiresAt).toLocaleDateString() : '-'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <StatusBadge status={w.status} expiresAt={w.expiresAt} />
                                                    </td>

                                                    {/* Actions */}
                                                    {/* Actions */}
                                                    <td className="px-6 py-5 text-right font-medium">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button
                                                                onClick={() => handleViewWarranty(w)}
                                                                className="p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <ActionMenu warranty={w} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                <div className="pb-32" />
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in h-[calc(100vh-12rem)] flex flex-col">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
                                {/* Search Bar - Reused Style */}
                                <div className="p-4 border-b border-slate-100 flex gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                        <input
                                            placeholder="Search jobs..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm font-medium placeholder:text-slate-500"
                                        />
                                    </div>

                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="h-10 px-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 focus:bg-white text-sm font-medium text-slate-600 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        <option value="ALL">All Status</option>
                                        <option value="RECEIVED">Received</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="READY">Ready</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>

                                {/* Table */}
                                <div className="flex-1 overflow-auto">
                                    {viewMode === 'JOBS' ? (
                                        <table className="w-full text-sm text-left border-separate border-spacing-0">
                                            <thead className="bg-slate-50/95 backdrop-blur z-10 sticky top-0 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4 rounded-tl-xl border-b border-slate-100">Job ID</th>
                                                    <th className="px-6 py-4 border-b border-slate-100">Customer</th>
                                                    <th className="px-6 py-4 border-b border-slate-100">Device</th>
                                                    <th className="px-6 py-4 border-b border-slate-100">Problem</th>
                                                    <th className="px-6 py-4 border-b border-slate-100">Est. Delivery</th>
                                                    <th className="px-6 py-4 border-b border-slate-100">Status</th>
                                                    <th className="px-6 py-4 text-right border-b border-slate-100">Est. Cost</th>
                                                    <th className="px-6 py-4 text-center rounded-tr-xl border-b border-slate-100">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white">
                                                {filteredJobSheets.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={8} className="py-20 text-center text-gray-300">
                                                            <div className="flex flex-col items-center gap-3">
                                                                <Search className="h-8 w-8 text-slate-200" />
                                                                <span>No jobs found matching your search.</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredJobSheets.map((j) => (
                                                        <tr key={j.id} className="hover:bg-slate-50/80 transition-all duration-200 group border-b border-slate-50">
                                                            <td className="px-6 py-5 align-middle">
                                                                <button
                                                                    onClick={() => handleViewJob(j)}
                                                                    className="flex flex-col text-left group-hover:scale-105 transition-transform"
                                                                >
                                                                    <span className="text-primary font-bold tracking-tight text-xs opacity-70">JO-</span>
                                                                    <span className="text-slate-900 font-bold font-mono text-sm group-hover:text-primary transition-colors">{j.jobId.split('-')[1]}</span>
                                                                </button>
                                                            </td>
                                                            <td className="px-6 py-5 align-middle">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <div className="font-bold text-slate-800 text-sm">{j.customerName}</div>
                                                                    <a href={`tel:${j.customerPhone}`} className="text-xs text-slate-400 font-medium hover:text-primary transition-colors flex items-center gap-1">
                                                                        {j.customerPhone}
                                                                    </a>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 align-middle text-slate-700 font-semibold text-sm capitalize">{j.deviceModel}</td>
                                                            <td className="px-6 py-5 align-middle">
                                                                <div className="text-slate-500 text-xs font-medium max-w-[150px] truncate bg-slate-100 px-2 py-1 rounded-md" title={j.problemDesc}>
                                                                    {j.problemDesc}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 align-middle text-slate-600 font-medium text-sm">
                                                                {j.expectedAt ? (
                                                                    <div className="flex items-center gap-1.5 bg-white border border-slate-100 px-2 py-1 rounded-md w-fit">
                                                                        <Calendar className="h-3 w-3 text-slate-400" />
                                                                        {new Date(j.expectedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-slate-300 px-2">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-5 align-middle">
                                                                <span className={cn(
                                                                    "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm border",
                                                                    j.status === 'RECEIVED' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                                        j.status === 'IN_PROGRESS' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                                            j.status === 'READY' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                                                j.status === 'DELIVERED' ? "bg-slate-100 text-slate-600 border-slate-200" :
                                                                                    "bg-red-50 text-red-700 border-red-100"
                                                                )}>
                                                                    <span className={cn("w-1.5 h-1.5 rounded-full",
                                                                        j.status === 'RECEIVED' ? "bg-blue-500" :
                                                                            j.status === 'IN_PROGRESS' ? "bg-amber-500 animate-pulse" :
                                                                                j.status === 'READY' ? "bg-emerald-500" :
                                                                                    j.status === 'DELIVERED' ? "bg-slate-400" :
                                                                                        "bg-red-500"
                                                                    )}></span>
                                                                    {j.status.replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-5 align-middle font-bold text-slate-900 text-right text-base">
                                                                {j.estimatedCost ? `₹${j.estimatedCost.toLocaleString()}` : <span className="text-slate-300">-</span>}
                                                            </td>
                                                            <td className="px-6 py-5 align-middle text-center">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            // WhatsApp Logic - Same as before
                                                                            const message = encodeURIComponent(
                                                                                `${String.fromCodePoint(0x1F44B)} Hello *${j.customerName}*,\n\n` +
                                                                                `Update from *${shop.shopName}* regarding your repair:\n\n` +
                                                                                `${String.fromCodePoint(0x1F4F1)} *Device:* ${j.deviceModel}\n` +
                                                                                `${String.fromCodePoint(0x1F194)} *Job ID:* ${j.jobId}\n` +
                                                                                `${String.fromCodePoint(0x1F4CA)} *Current Status:* *${j.status}*\n` +
                                                                                (j.status === 'READY' ? `\n${String.fromCodePoint(0x1F4B0)} *Bill Amount:* ₹${j.estimatedCost || '0'}\n${String.fromCodePoint(0x2705)} *Your device is READY for pickup!*\n` : '') +
                                                                                `\n--------------------------------\n` +
                                                                                `Thank you for trusting us! ${String.fromCodePoint(0x1F64F)}\n` +
                                                                                `_Powered by FixSure_ ${String.fromCodePoint(0x1F6E1)}`
                                                                            );
                                                                            console.log("WhatsApp Message:", decodeURIComponent(message));
                                                                            window.open(`https://api.whatsapp.com/send?phone=${j.customerPhone.replace(/\D/g, '')}&text=${message}`, '_blank');
                                                                        }}
                                                                        className="bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                                                                        title="Notify Customer"
                                                                    >
                                                                        <MessageCircle className="h-3.5 w-3.5" />
                                                                        <span className="hidden xl:inline">Notify</span>
                                                                    </button>

                                                                    <JobActionMenu job={j} shop={shop} />

                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedJobSheet(j);
                                                                            setViewMode('JOB_CUSTOMER_DETAILS');
                                                                        }}
                                                                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
                                                                        title="View Customer Details"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Modals from before */}
            {showCreateModal && <CreateModal onClose={() => setShowCreateModal(false)} />}
            {showJobSheetModal && <JobSheetModal onClose={() => setShowJobSheetModal(false)} />}

            {/* Pin & Logout Modals... */}
            {showPinModal && <PinModal onClose={() => setShowPinModal(false)} onSuccess={handlePinSuccess} mode={pinMode} />}

            {showLogoutConfirm && (
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
            )}

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
            "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
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
                            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase">Update Status</div>
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
                            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Update Status</div>
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
        <div className="p-7 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group h-full">
            <div className="mb-4 flex items-start justify-between">
                <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {Icon ? <Icon className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                </div>
                {secure && onToggle && (
                    <button
                        onClick={onToggle}
                        className="text-slate-300 hover:text-primary transition-colors focus:outline-none p-1"
                    >
                        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                )}
            </div>

            <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-1">{title}</h3>
                <div className={cn("text-3xl font-bold mb-2 tracking-tight", highlight ? "text-primary" : "text-slate-900")}>
                    {secure && !isVisible ? "••••••" : value}
                </div>
            </div>
            <div className="text-xs text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-1 rounded-md">{sub}</div>
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
                    <h2 className="text-lg font-bold">
                        {mode === 'SET' ? "Set Security PIN" : "Enter Security PIN"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
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
                                className="w-12 h-14 text-center text-2xl font-bold rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
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
                        className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
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
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
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
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
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
                        <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl border border-border font-medium hover:bg-secondary transition-colors text-muted-foreground text-sm uppercase tracking-wide">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
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
