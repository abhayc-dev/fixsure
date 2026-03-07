"use client";

import { useState } from "react";
import {
    ShieldCheck,
    CheckCircle,
    Activity,
    DollarSign,
    Eye,
    EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashCircularChart, DashRevenueChart } from "@/components/dash-charts";
import PinModal from "@/components/PinModal";

type Stats = {
    total: number;
    active: number;
    revenue: number;
    monthlyRevenue: number;
    weeklyChart: { label: string, value: number }[];
    monthlyChart: { label: string, value: number }[];
    jobChart: { label: string, value: number }[];
    jobDistribution: { label: string, value: number, color: string }[];
    shopName: string | null;
    subscription: string;
    isVerified: boolean;
    hasAccessPin: boolean;
}

export default function ReportsView({ stats }: { stats: Stats }) {
    const [isRevenueVisible, setIsRevenueVisible] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
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

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {showPinModal && (
                <PinModal
                    onClose={() => setShowPinModal(false)}
                    onSuccess={handlePinSuccess}
                    mode={pinMode}
                />
            )}

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
