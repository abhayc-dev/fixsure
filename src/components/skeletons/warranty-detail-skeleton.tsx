import { Skeleton } from "@/components/ui/skeleton"

export function WarrantyDetailSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50/20 p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Back Link */}
                <Skeleton className="h-4 w-32 bg-slate-200" />

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-3">
                            <Skeleton className="h-8 w-48 bg-slate-200" />
                            <Skeleton className="h-4 w-32 bg-slate-100" />
                            <Skeleton className="h-4 w-48 bg-slate-100" />
                        </div>
                        <div className="space-y-2 flex flex-col md:items-end">
                            <Skeleton className="h-7 w-24 bg-slate-100" />
                            <Skeleton className="h-4 w-32 bg-slate-100" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Device Details */}
                        <div className="space-y-6">
                            <Skeleton className="h-5 w-32 border-b border-slate-100 pb-2 bg-slate-200" />
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full bg-slate-100" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-3 w-12 bg-slate-100" />
                                        <Skeleton className="h-4 w-32 bg-slate-200" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Warranty Status */}
                        <div className="space-y-6">
                            <Skeleton className="h-5 w-32 border-b border-slate-100 pb-2 bg-slate-200" />
                            <div className="flex gap-3">
                                <Skeleton className="h-8 w-8 rounded-full bg-slate-100" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-3 w-16 bg-slate-100" />
                                    <Skeleton className="h-4 w-32 bg-slate-200" />
                                    <Skeleton className="h-6 w-20 rounded-full bg-slate-100" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Link */}
                    <div className="p-6 border-t border-slate-100 flex justify-center">
                        <Skeleton className="h-4 w-48 bg-slate-100" />
                    </div>
                </div>
            </div>
        </div>
    )
}
