"use client";

import Link from "next/link";
import { useState } from "react";
import {
    BarChart,
    Users,
    ShieldAlert,
    DollarSign,
    Store,
    Search,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Lock,
    Unlock,
    LogOut,
    Trash,
    Wrench,
    Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleShopStatus, deleteShop } from "@/lib/actions";
import { logout } from "@/lib/auth-actions";

type Shop = {
    id: string;
    repo?: any;
    shopName: string | null;
    phone: string;
    isVerified: boolean;
    subscriptionStatus: string;
    warrantyCount: number;
    isFlagged: boolean;
    createdAt: Date;
};

type Stats = {
    totalShops: number;
    activeSubs: number;
    warrantiesToday: number;
    revenue: number;
}

export default function AdminDashboard({ stats, initialShops, initialJobs = [] }: { stats: Stats, initialShops: any[], initialJobs?: any[] }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [shops, setShops] = useState(initialShops);
    const [jobs] = useState(initialJobs); // Read-only for now
    const [search, setSearch] = useState("");

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setShops(shops.map(s => s.id === id ? { ...s, isVerified: !currentStatus } : s));
        await toggleShopStatus(id, currentStatus);
    };

    const filteredShops = shops.filter(s =>
        (s.shopName || '').toLowerCase().includes(search.toLowerCase()) ||
        s.phone.includes(search)
    );

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary/20 selection:text-primary">

            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col gap-8 hidden md:flex sticky top-0 h-screen z-20 shadow-sm">
                <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-slate-900">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    FixSure
                </div>

                <nav className="flex flex-col gap-2">
                    <NavButton
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                        icon={<BarChart className="w-5 h-5" />}
                        label="Overview"
                    />
                    <NavButton
                        active={activeTab === 'shops'}
                        onClick={() => setActiveTab('shops')}
                        icon={<Store className="w-5 h-5" />}
                        label="Shop Management"
                    />
                    <NavButton
                        active={activeTab === 'abuse'}
                        onClick={() => setActiveTab('abuse')}
                        icon={<ShieldAlert className="w-5 h-5" />}
                        label="Abuse Monitor"
                    />
                    <NavButton
                        active={activeTab === 'repairs'}
                        onClick={() => setActiveTab('repairs')}
                        icon={<Wrench className="w-5 h-5" />}
                        label="Repair Jobs"
                    />
                    <NavButton
                        active={activeTab === 'revenue'}
                        onClick={() => setActiveTab('revenue')}
                        icon={<DollarSign className="w-5 h-5" />}
                        label="Revenue"
                    />
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all w-full text-left font-medium group"
                    >
                        <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <span className="text-sm">Sign Out</span>
                    </button>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">A</div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">Abhay (Founder)</div>
                            <div className="text-xs text-slate-500">Super Admin</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

                {/* Mobile Header */}
                <header className="md:hidden h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-30 sticky top-0">
                    <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                        <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center text-white">
                            <ShieldAlert className="w-4 h-4" />
                        </div>
                        FixSure Admin
                    </div>
                    <button onClick={() => logout()} className="text-slate-500 hover:text-red-500 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
                                    <p className="text-slate-500 mt-1 text-sm">Welcome back. Here is your daily performance summary.</p>
                                </div>
                                <div className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm text-slate-600 font-medium shadow-sm">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard title="Total Shops" value={stats.totalShops} icon={<Store className="text-white" />} color="bg-blue-500" trend="+2 this week" />
                                <StatCard title="Active Subs" value={stats.activeSubs} icon={<CheckCircle className="text-white" />} color="bg-emerald-500" trend="85% conversion" />
                                <StatCard title="Warranties Today" value={stats.warrantiesToday} icon={<ShieldAlert className="text-white" />} color="bg-violet-500" trend="+12% vs yest" />
                                <StatCard title="Monthly Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={<DollarSign className="text-white" />} color="bg-primary" isMoney />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Recent Activity Mockup */}
                                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-primary" /> Recent Signups
                                        </h3>
                                        <Link href="#" onClick={() => setActiveTab('shops')} className="text-xs font-bold text-primary hover:underline">View All</Link>
                                    </div>
                                    <div className="space-y-2">
                                        {filteredShops.slice(0, 5).map(shop => (
                                            <div key={shop.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                                                        {(shop.shopName || 'Shop')[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-sm">{shop.shopName}</div>
                                                        <div className="text-xs text-slate-500 font-medium">{new Date(shop.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <div className={cn("text-xs px-2.5 py-1 rounded-full font-bold border", shop.subscriptionStatus === 'ACTIVE' ? "bg-green-50 text-green-700 border-green-100" : "bg-yellow-50 text-yellow-700 border-yellow-100")}>
                                                    {shop.subscriptionStatus}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Revenue Mockup */}
                                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-emerald-500" /> Revenue Trend
                                        </h3>
                                        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+18% growth</div>
                                    </div>
                                    <div className="h-64 flex items-end gap-2 px-4 py-2 border-b border-slate-100">
                                        {[40, 65, 45, 80, 55, 90, 100].map((h, i) => (
                                            <div key={i} className="flex-1 bg-primary/10 rounded-t-lg hover:bg-primary transition-colors relative group overflow-hidden" style={{ height: `${h}%` }}>
                                                <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-10 font-bold">
                                                    ₹{h * 100}
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-4 px-2 tracking-widest">
                                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shops Management Tab */}
                    {activeTab === 'shops' && (
                        <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Shop Management</h1>
                                <p className="text-slate-500 mt-1">Manage payments, access, and subscriptions.</p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
                                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search details..."
                                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 shadow-sm"
                                        />
                                    </div>
                                    <button className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-white text-sm font-bold shadow-lg shadow-slate-900/10 transition-all flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        Add Shop
                                    </button>
                                </div>

                                <div className="overflow-auto flex-1">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-slate-50/90 backdrop-blur-sm text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4 whitespace-nowrap">Shop Details</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Plan</th>
                                                <th className="px-6 py-4 text-center whitespace-nowrap">Job Count</th>
                                                <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {filteredShops.map(shop => (
                                                <tr key={shop.id} className="hover:bg-slate-50/80 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <Link href={`/admin/shops/${shop.id}`} className="font-bold text-slate-900 hover:text-primary transition-colors block text-base leading-tight">
                                                            {shop.shopName}
                                                        </Link>
                                                        <div className="text-slate-500 text-xs mt-1 font-medium">{shop.phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {shop.isVerified ? (
                                                            <span className="inline-flex items-center gap-1.5 text-green-700 text-xs font-bold bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                                                                <CheckCircle className="w-3.5 h-3.5" /> Verified
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-red-700 text-xs font-bold bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                                                                <XCircle className="w-3.5 h-3.5" /> Blocked
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={cn("inline-block px-2.5 py-1 rounded-md text-xs font-bold border capitalize",
                                                            shop.subscriptionStatus === 'ACTIVE' ? "text-primary bg-primary/5 border-primary/20" : "text-slate-500 bg-slate-100 border-slate-200"
                                                        )}>
                                                            {shop.subscriptionStatus.toLowerCase()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={cn("font-bold px-2 py-0.5 rounded", shop.warrantyCount > 50 ? "text-primary bg-primary/5" : "text-slate-600")}>
                                                            {shop.warrantyCount}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleToggleStatus(shop.id, shop.isVerified)}
                                                                className={cn("p-2 rounded-lg transition-colors border shadow-sm", shop.isVerified ? "bg-white text-slate-600 border-slate-200 hover:border-red-200 hover:text-red-600 hover:bg-red-50" : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100")}
                                                                title={shop.isVerified ? "Block Shop" : "Unblock Shop"}
                                                            >
                                                                {shop.isVerified ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm(`Delete ${shop.shopName}? This action is irreversible.`)) {
                                                                        setShops(shops.filter(s => s.id !== shop.id));
                                                                        await deleteShop(shop.id);
                                                                    }
                                                                }}
                                                                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                                                                title="Delete Shop"
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Abuse Monitor Tab */}
                    {activeTab === 'abuse' && (
                        <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                                    <ShieldAlert className="w-8 h-8 text-red-500" /> Abuse Monitor
                                </h1>
                                <p className="text-slate-500">Shops with suspicious activity or high warranty limits.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {shops.filter(s => s.isFlagged).length === 0 ? (
                                    <div className="col-span-2 p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-200">
                                            <CheckCircle className="w-10 h-10 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">System Secure</h3>
                                        <p className="text-slate-500 max-w-sm mx-auto">No suspicious activity detected. All shops are operating within normal parameters.</p>
                                    </div>
                                ) : (
                                    shops.filter(s => s.isFlagged).map(shop => (
                                        <div key={shop.id} className="bg-white border border-red-100 shadow-lg shadow-red-500/5 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <AlertTriangle className="w-32 h-32 text-red-500" />
                                            </div>

                                            <div className="flex justify-between items-start z-10">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900">{shop.shopName}</h3>
                                                    <p className="text-slate-500 text-sm font-mono">{shop.phone}</p>
                                                </div>
                                                <div className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100 tracking-wider">
                                                    Flagged
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-red-50 z-10">
                                                <div className="bg-red-50/50 p-3 rounded-lg">
                                                    <div className="text-xs text-red-400 font-bold tracking-wider mb-1">Total Warranties</div>
                                                    <div className="text-2xl font-bold text-red-600">{shop.warrantyCount}</div>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-lg">
                                                    <div className="text-xs text-slate-400 font-bold tracking-wider mb-1">Status</div>
                                                    <div className="text-sm font-bold text-slate-700">{shop.subscriptionStatus}</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 z-10">
                                                <button
                                                    onClick={() => handleToggleStatus(shop.id, true)}
                                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 text-sm"
                                                >
                                                    <Lock className="w-4 h-4" /> Block Shop
                                                </button>
                                                <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2.5 rounded-xl transition-colors text-sm">
                                                    Dismiss Alert
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Repairs Tab */}
                    {activeTab === 'repairs' && (
                        <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Repair Jobs</h1>
                                <p className="text-slate-500 mt-1">Live feed of repair jobs from all shops.</p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
                                {/* Reuse Search (Optional: could filter jobs too but keeping simple for now) */}
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            placeholder="Search jobs..."
                                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 shadow-sm"
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="overflow-auto flex-1">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-slate-50/90 backdrop-blur-sm text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4 whitespace-nowrap">Job ID</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Shop / Owner</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Device Info</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                                <th className="px-6 py-4 whitespace-nowrap text-right">Received</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {jobs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                                        No repair jobs found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                jobs.map((job) => (
                                                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors group">
                                                        <td className="px-6 py-4 font-mono font-bold text-primary text-xs">
                                                            {job.jobId}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-900">{job.shop?.shopName}</div>
                                                            <div className="text-xs text-slate-500 font-medium">{job.shop?.ownerName}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-900">{job.customerName}</div>
                                                            <div className="text-xs text-slate-500 font-medium">{job.customerPhone}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-slate-700">{job.deviceModel}</div>
                                                            <div className="text-xs text-slate-500 max-w-[200px] truncate" title={job.problemDesc}>{job.problemDesc}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={cn(
                                                                "px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide border",
                                                                job.status === 'RECEIVED' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                                    job.status === 'READY' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                                        job.status === 'DELIVERED' ? "bg-slate-100 text-slate-500 border-slate-200" :
                                                                            "bg-orange-50 text-orange-600 border-orange-100"
                                                            )}>
                                                                {job.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-slate-500 text-xs font-medium">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5 opacity-50" />
                                                                {new Date(job.receivedAt).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Revenue Tab - Placeholder */}
                    {activeTab === 'revenue' && (
                        <div className="flex items-center justify-center h-[60vh] text-slate-400 animate-in fade-in duration-500">
                            <div className="text-center max-w-sm px-6">
                                <div className="bg-slate-50 p-8 rounded-full inline-block mb-6 shadow-inner">
                                    <DollarSign className="w-16 h-16 text-slate-300" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-3">Detailed Insights Coming Soon</h2>
                                <p className="text-slate-500 leading-relaxed">We're building comprehensive financial reports to help you track growth, churn, and MRR. Stay tuned for version 2.0.</p>
                                <button className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:scale-105 transition-transform" disabled>
                                    Notify Me
                                </button>
                            </div>
                        </div>
                    )}

                </main>

                {/* Mobile Bottom Nav */}
                <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-2 grid grid-cols-4 gap-1 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <MobileNavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart className="w-5 h-5" />} label="Home" />
                    <MobileNavButton active={activeTab === 'shops'} onClick={() => setActiveTab('shops')} icon={<Store className="w-5 h-5" />} label="Shops" />
                    <MobileNavButton active={activeTab === 'abuse'} onClick={() => setActiveTab('abuse')} icon={<ShieldAlert className="w-5 h-5" />} label="Abuse" />
                    <MobileNavButton active={activeTab === 'repairs'} onClick={() => setActiveTab('repairs')} icon={<Wrench className="w-5 h-5" />} label="Repairs" />
                </div>
            </div >
        </div >
    );
}

function MobileNavButton({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all",
                active ? "text-primary bg-primary/10 font-bold" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
        >
            {icon}
            <span className="text-[10px]">{label}</span>
        </button>
    )
}

function NavButton({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                active
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-slate-500 hover:bg-slate-50 hover:text-primary"
            )}
        >
            {icon}
            {label}
        </button>
    )
}

function StatCard({ title, value, icon, trend, isMoney, color = "bg-primary" }: any) {
    return (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl hover:border-primary/20 transition-all shadow-sm group hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-xl shadow-md text-white group-hover:scale-110 transition-transform duration-300", color)}>
                    {icon}
                </div>
                {trend && <div className={cn("text-xs font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-100", trend.includes('+') ? "text-green-600 bg-green-50 border-green-100" : "")}>{trend}</div>}
            </div>
            <div>
                <p className="text-slate-400 text-xs font-bold tracking-wider mb-1">{title}</p>
                <h3 className={cn("text-2xl font-bold text-slate-800", isMoney && "font-mono tracking-tight")}>{value}</h3>
            </div>
        </div>
    )
}
