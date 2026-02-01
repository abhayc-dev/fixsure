"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// --- Job Distribution Circular Chart (Donut) ---

export function DashCircularChart({
    data
}: {
    data: { label: string, value: number, color: string }[]
}) {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    // Calculate segments
    let cumulativePercent = 0;
    const segments = data.map(d => {
        const percent = total === 0 ? 0 : d.value / total;
        const start = cumulativePercent;
        cumulativePercent += percent;
        return { ...d, percent, start };
    });

    // SVG geometry
    const size = 220;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="relative w-[220px] h-[220px] flex-shrink-0">
                <svg width="220" height="220" viewBox="0 0 220 220" className="transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                        cx="110"
                        cy="110"
                        r={radius}
                        fill="transparent"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={strokeWidth}
                    />

                    {/* Data Segments */}
                    {total > 0 && segments.map((d, i) => {
                        const dashArray = `${d.percent * circumference} ${circumference}`;
                        const dashOffset = -d.start * circumference;

                        return (
                            <circle
                                key={i}
                                cx="110"
                                cy="110"
                                r={radius}
                                fill="transparent"
                                stroke={d.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={dashArray}
                                strokeDashoffset={dashOffset}
                                strokeLinecap="round"
                                className="transition-all duration-700 ease-in-out hover:opacity-80"
                            />
                        );
                    })}
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-black text-white font-display mb-1">{total}</span>
                    <span className="text-[10px] font-black text-slate-500 tracking-[0.2em]">Total Assets</span>
                </div>
            </div>
        </div>
    );
}

// --- Revenue Bar Chart ---

export function DashRevenueChart({
    data,
    isVisible
}: {
    data: { label: string, value: number }[],
    isVisible: boolean
}) {
    const [filter, setFilter] = useState<'Month' | 'Quarter' | 'Year'>('Month');

    // Process data based on filter
    const chartData = useMemo(() => {
        if (filter === 'Month') return data.slice(-12); // Last 12 months

        if (filter === 'Quarter') {
            // Group into quarters (mock logic for visualization)
            // Assuming data is sorted Jan -> Dec or similar sequence
            // We just take chunks of 3 for demo if dates aren't perfect in label
            const quarters = [];
            for (let i = 0; i < data.length; i += 3) {
                const chunk = data.slice(i, i + 3);
                const sum = chunk.reduce((acc, c) => acc + c.value, 0);
                const label = chunk[0]?.label ? `Q${Math.floor(i / 3) + 1}` : '';
                quarters.push({ label, value: sum });
            }
            return quarters;
        }

        if (filter === 'Year') {
            const sum = data.reduce((acc, c) => acc + c.value, 0);
            return [{ label: new Date().getFullYear().toString(), value: sum }];
        }
        return data;
    }, [data, filter]);

    const maxValue = Math.max(...chartData.map(d => d.value), 100); // Avoid divide by zero

    return (
        <div className="w-full">
            {/* Header / Filter */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-800">Revenue Analytics</h3>
                <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                    {['Month', 'Quarter', 'Year'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                                filter === f ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Area */}
            <div className="h-64 w-full flex items-end gap-2 md:gap-4 relative px-2">
                {/* Y-Axis Grid Lines (Simplified) */}
                <div className="absolute inset-x-0 bottom-0 h-full flex flex-col justify-between pointer-events-none z-0 opacity-20">
                    <div className="w-full border-t border-slate-300"></div>
                    <div className="w-full border-t border-slate-300"></div>
                    <div className="w-full border-t border-slate-300"></div>
                    <div className="w-full border-t border-slate-300"></div>
                </div>

                {chartData.map((d, i) => {
                    const heightPercent = Math.max((d.value / maxValue) * 100, 4);
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group z-10 h-full justify-end">
                            {/* Bar Wrapper for proper tooltip positioning */}
                            <div
                                className="relative w-full max-w-[40px] flex flex-col justify-end group"
                                style={{ height: `${heightPercent}%` }}
                            >
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#FF6442] text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-20">
                                    {isVisible ? `₹${d.value.toLocaleString()}` : '••••'}
                                    {/* Arrow */}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FF6442] rotate-45"></div>
                                </div>

                                {/* Bar */}
                                <div className="w-full h-full bg-[#FF6442] rounded-t-lg hover:opacity-90 transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                                </div>
                            </div>

                            {/* Label */}
                            <div className="text-[10px] md:text-xs font-bold text-slate-400 truncate w-full text-center">
                                {d.label}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* X-Axis Line */}
            <div className="h-px w-full bg-slate-200 mt-[-1px] relative z-20"></div>
        </div>
    );
}
