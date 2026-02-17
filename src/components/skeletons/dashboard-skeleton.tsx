import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
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
        </div>
    )
}
