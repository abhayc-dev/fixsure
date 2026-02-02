import { Skeleton } from "@/components/ui/skeleton";

export function JobDetailSkeleton() {
    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 px-4 md:px-6">

            {/* Top Bar Skeleton */}
            <div className="sticky top-0 z-50 bg-slate-50/80 backdrop-blur-md py-4 border-b border-slate-200/50 -mx-4 md:-mx-6 px-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Skeleton className="h-10 w-48 rounded-2xl bg-slate-200" />
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl bg-slate-100" />
                    <div className="w-px h-6 bg-slate-200" />
                    <Skeleton className="h-10 w-24 rounded-xl bg-slate-100" />
                    <Skeleton className="h-10 w-24 rounded-xl bg-slate-100" />
                    <Skeleton className="h-10 w-40 rounded-xl bg-slate-200" />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Left Sidebar Skeleton */}
                <div className="lg:w-80 w-full space-y-6 sticky top-30">
                    {/* SLA Timeline */}
                    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-xl bg-slate-100" />
                            <Skeleton className="h-4 w-32 bg-slate-100" />
                        </div>
                        <div className="space-y-10 pl-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-4 w-4 rounded-full bg-slate-200" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-20 bg-slate-100" />
                                        <Skeleton className="h-5 w-28 bg-slate-200" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Asset Metadata */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-xl bg-slate-100" />
                            <Skeleton className="h-4 w-32 bg-slate-100" />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-20 bg-slate-100" />
                                <Skeleton className="h-4 w-32 bg-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-20 bg-slate-100" />
                                <Skeleton className="h-4 w-32 bg-slate-200" />
                            </div>
                        </div>
                    </div>

                    {/* Reported Issue */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-xl bg-slate-100" />
                            <Skeleton className="h-4 w-32 bg-slate-100" />
                        </div>
                        <Skeleton className="h-16 w-full rounded-xl bg-slate-100/50" />
                    </div>
                </div>

                {/* Main Canvas Skeleton */}
                <div className="flex-1 space-y-5 w-full">
                    {/* Customer Identity */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="flex items-center gap-8 w-full md:w-auto">
                            <Skeleton className="h-20 w-20 rounded-2xl bg-slate-100" />
                            <div className="space-y-3">
                                <div className="flex gap-3 items-center">
                                    <Skeleton className="h-8 w-48 bg-slate-200" />
                                    <Skeleton className="h-6 w-20 rounded-md bg-slate-100" />
                                </div>
                                <div className="flex gap-6">
                                    <Skeleton className="h-4 w-32 bg-slate-100" />
                                    <Skeleton className="h-6 w-32 rounded-lg bg-slate-100" />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                            <Skeleton className="h-4 w-40 bg-slate-100" />
                            <Skeleton className="h-5 w-56 bg-slate-200" />
                        </div>
                    </div>

                    {/* Motor Details Skeleton */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-1 rounded-full bg-slate-300" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-32 bg-slate-200" />
                                    <Skeleton className="h-3 w-48 bg-slate-100" />
                                </div>
                            </div>
                            <Skeleton className="h-10 w-24 rounded-full bg-slate-100" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-3 w-20 bg-slate-100" />
                                    <Skeleton className="h-6 w-24 bg-slate-200" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Coil Details Skeleton */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col p-6 space-y-6 h-64">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-1 rounded-full bg-slate-300" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-32 bg-slate-200" />
                                    <Skeleton className="h-3 w-48 bg-slate-100" />
                                </div>
                            </div>
                            <Skeleton className="h-10 w-24 rounded-full bg-slate-100" />
                        </div>
                        <div className="flex gap-6">
                            <div className="flex-1 space-y-4">
                                <Skeleton className="h-8 w-32 mx-auto bg-slate-100 rounded-full" />
                                <Skeleton className="h-20 w-full bg-slate-50 rounded-xl" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <Skeleton className="h-8 w-32 mx-auto bg-slate-100 rounded-full" />
                                <Skeleton className="h-20 w-full bg-slate-50 rounded-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Accounting Ledger Skeleton */}
                    <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                            <div className="space-y-6 flex-1">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32 bg-slate-700" />
                                    <Skeleton className="h-3 w-48 bg-slate-800" />
                                </div>
                                <div className="flex gap-8">
                                    <Skeleton className="h-16 w-32 bg-slate-800 rounded-xl" />
                                    <Skeleton className="h-16 w-32 bg-slate-800 rounded-xl" />
                                    <Skeleton className="h-16 w-32 bg-slate-800 rounded-xl" />
                                </div>
                            </div>
                            <div className="w-full md:w-80 bg-slate-800/50 rounded-3xl border border-slate-700/50 p-6 space-y-4">
                                <Skeleton className="h-6 w-full bg-slate-700" />
                                <div className="space-y-2 border-t border-slate-700 pt-4">
                                    <div className="flex justify-between"><Skeleton className="h-4 w-20 bg-slate-700" /><Skeleton className="h-4 w-16 bg-slate-700" /></div>
                                    <div className="flex justify-between"><Skeleton className="h-4 w-20 bg-slate-700" /><Skeleton className="h-4 w-16 bg-slate-700" /></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
