import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            {/* Sidebar Skeleton */}
            <div className="hidden md:flex w-64 flex-col justify-between border-r border-slate-800/50 bg-[#0F172A] p-4">
                <div className="space-y-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3 px-4 py-4">
                        <Skeleton className="h-10 w-10 rounded-2xl bg-slate-800" />
                        <Skeleton className="h-6 w-24 bg-slate-800" />
                    </div>

                    {/* Nav Items */}
                    <div className="space-y-3 px-2">
                        <Skeleton className="h-12 w-full rounded-2xl bg-slate-800/50" />
                        <Skeleton className="h-12 w-full rounded-2xl bg-slate-800/50" />
                        <div className="h-4" />
                        <Skeleton className="h-10 w-full rounded-2xl bg-slate-800/30" />
                        <Skeleton className="h-10 w-full rounded-2xl bg-slate-800/30" />
                        <Skeleton className="h-10 w-full rounded-2xl bg-slate-800/30" />
                    </div>
                </div>

                {/* User Profile */}
                <div className="p-2">
                    <Skeleton className="h-20 w-full rounded-2xl bg-slate-800" />
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="h-24 border-b border-slate-200/60 bg-white/80 px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-5">
                        <Skeleton className="h-10 w-1.5 rounded-full bg-slate-200" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48 bg-slate-200" />
                            <Skeleton className="h-3 w-32 bg-slate-100" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-32 rounded-2xl bg-slate-100" />
                    </div>
                </header>

                <main className="flex-1 p-8 space-y-8 overflow-auto">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 rounded-3xl bg-white border border-slate-100 p-6 flex flex-col justify-between shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24 bg-slate-100" />
                                        <Skeleton className="h-8 w-16 bg-slate-200" />
                                    </div>
                                    <Skeleton className="h-10 w-10 rounded-full bg-slate-50" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table Area */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm min-h-[500px] flex flex-col gap-6">
                        {/* Control Bar */}
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <Skeleton className="h-14 w-full md:w-1/3 rounded-[1.25rem] bg-slate-50" />
                            <div className="flex gap-3">
                                <Skeleton className="h-14 w-24 rounded-[1.25rem] bg-slate-50" />
                                <Skeleton className="h-14 w-32 rounded-[1.25rem] bg-slate-100" />
                            </div>
                        </div>

                        {/* Table Rows */}
                        <div className="space-y-4">
                            <div className="flex justify-between px-4">
                                <Skeleton className="h-4 w-20 bg-slate-100" />
                                <Skeleton className="h-4 w-32 bg-slate-100" />
                                <Skeleton className="h-4 w-32 bg-slate-100" />
                                <Skeleton className="h-4 w-20 bg-slate-100" />
                                <Skeleton className="h-4 w-20 bg-slate-100" />
                            </div>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-20 w-full rounded-2xl bg-slate-50/50 flex items-center px-6 gap-6">
                                    <Skeleton className="h-10 w-10 rounded-full bg-slate-200" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-48 bg-slate-200" />
                                        <Skeleton className="h-3 w-32 bg-slate-100" />
                                    </div>
                                    <Skeleton className="h-8 w-24 rounded-lg bg-slate-200" />
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
