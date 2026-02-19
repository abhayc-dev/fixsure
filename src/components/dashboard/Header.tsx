"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, Wrench, Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

type Stats = {
    isVerified: boolean;
}

export default function Header({ isPlanActive, stats }: { isPlanActive: boolean, stats: Stats }) {
    const pathname = usePathname();
    const { toggleMobileMenu } = useSidebar();

    const getTitle = () => {
        if (pathname.includes('/warranties')) return pathname.endsWith('/new') ? "New Warranty" : "Warranty Data";
        if (pathname.includes('/jobs')) return pathname.endsWith('/new') ? "New Job Sheet" : "Repair Data";
        if (pathname.includes('/reports')) return "Insight Hub";
        if (pathname.includes('/settings')) return "Control Center";
        return "Dashboard";
    };

    // Hide Header on Job Details and Invoice pages (sub-routes of /jobs)
    if (pathname.startsWith('/jobs/')) {
        return null;
    }

    const showCreateJob = pathname === '/jobs';
    const showCreateWarranty = pathname === '/warranties';

    return (
        <header className="h-20 md:h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 flex items-center px-4 md:px-10 transition-all">
            {/* Mobile Menu Toggle */}
            <button 
                onClick={toggleMobileMenu}
                className="md:hidden mr-2 p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Title Section */}
            <div className="flex items-center gap-3 md:gap-5 flex-none py-4">
                <div className="w-1.5 h-8 md:h-10 bg-primary rounded-full shrink-0 shadow-[0_0_15px_rgba(255,100,66,0.25)]" />
                <div className="flex flex-col flex-none">
                    <h1 className="text-lg md:text-3xl text-slate-900 font-display whitespace-nowrap leading-none tracking-tight">
                        {getTitle()}
                    </h1>
                    <p className="hidden sm:block text-[10px] md:text-xs font-bold text-slate-400 tracking-widest mt-1 md:mt-2 whitespace-nowrap opacity-60 uppercase">
                        FixSure Control Systems v2.0
                    </p>
                </div>
            </div>

            {/* Elastic Spacer */}
            <div className="flex-1" />

            {/* Actions Section */}
            <div className="flex items-center gap-3 md:gap-6 flex-none pr-0 md:pr-2">
                {showCreateJob && (
                    <Link
                        href="/jobs/new"
                        className={`flex items-center gap-2 bg-primary text-white px-3 md:px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 ${(!isPlanActive || !stats.isVerified) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    >
                        <Wrench className="h-4 w-4" />
                        <span className="hidden md:inline">Repair Entry</span>
                    </Link>
                )}

                {showCreateWarranty && (
                    <Link
                        href="/warranties/new"
                        className={`flex items-center gap-2 bg-primary text-white px-3 md:px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 ${(!isPlanActive || !stats.isVerified) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden md:inline">Add Warranty</span>
                    </Link>
                )}
            </div>
        </header>
    );
}
