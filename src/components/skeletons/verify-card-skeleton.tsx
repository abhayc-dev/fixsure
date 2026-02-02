import { Skeleton } from "@/components/ui/skeleton"

export function VerifyCardSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50/20 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                {/* Banner */}
                <div className="h-32 bg-slate-100 relative mb-12">
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                        <Skeleton className="h-20 w-20 rounded-2xl border-4 border-white shadow-sm bg-slate-200" />
                    </div>
                    <div className="absolute top-4 right-4">
                        <Skeleton className="h-6 w-20 rounded-full bg-slate-200/50" />
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 space-y-8">
                    <div className="space-y-3 text-center">
                        <Skeleton className="h-8 w-48 mx-auto bg-slate-200" />
                        <Skeleton className="h-4 w-32 mx-auto bg-slate-100" />
                    </div>

                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                <Skeleton className="h-4 w-24 bg-slate-200" />
                                <Skeleton className="h-4 w-32 bg-slate-300" />
                            </div>
                        ))}
                    </div>

                    <Skeleton className="h-14 w-full rounded-2xl bg-slate-900/10" />
                </div>
            </div>
        </div>
    )
}
