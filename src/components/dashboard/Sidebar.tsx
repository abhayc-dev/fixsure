"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ShieldCheck,
    Wrench,
    CheckCircle,
    Activity,
    Settings,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth-actions";

type Shop = {
    id: string;
    shopName: string;
    ownerName: string | null;
    companyLogoUrl?: string | null;
    category?: string;
}

type Stats = {
    subscription: string;
}

export default function Sidebar({ shop, stats, isPlanActive }: { shop: Shop, stats: Stats, isPlanActive: boolean }) {
    const pathname = usePathname();

    const navItems = [
        { href: '/jobs', icon: Wrench, label: 'Repair Jobs', activePattern: /^\/jobs/ },
        { href: '/warranties', icon: CheckCircle, label: 'Warranties', activePattern: /^\/warranties/ },
        { href: '/reports', icon: Activity, label: 'Reports', activePattern: /^\/reports/ },
        { href: '/settings', icon: Settings, label: 'Settings', activePattern: /^\/settings/ }
    ];

    return (
        <aside className="w-64 bg-[#0F172A] text-white flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-slate-800/50 relative overflow-hidden h-screen sticky top-0">
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

                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.activePattern.test(pathname);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3.5 w-full px-5 py-4 rounded-2xl text-sm font-bold transition-all group",
                                    isActive
                                        ? "bg-gradient-to-r from-primary/15 to-transparent text-primary border-l-4 border-primary rounded-l-none"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary" : "group-hover:text-primary")} />
                                <span className="font-display tracking-wide">{item.label}</span>
                            </Link>
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
                        <button onClick={() => logout()} className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors" title="Logout">
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
