import { Skeleton } from "@/components/ui/skeleton"

export function SubscriptionSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50/20 p-4 md:p-8 flex items-center justify-center">
            <div className="max-w-2xl w-full space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full bg-slate-200" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 bg-slate-200" />
                        <Skeleton className="h-4 w-32 bg-slate-100" />
                    </div>
                </div>

                {/* Status Card */}
                <Skeleton className="h-32 w-full rounded-2xl bg-slate-100" />

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4 p-6 border border-slate-200 rounded-2xl h-96">
                        <Skeleton className="h-8 w-3/4 bg-slate-200" />
                        <Skeleton className="h-12 w-1/2 bg-slate-200" />
                        <div className="space-y-3 flex-1">
                            <Skeleton className="h-4 w-full bg-slate-100" />
                            <Skeleton className="h-4 w-full bg-slate-100" />
                            <Skeleton className="h-4 w-full bg-slate-100" />
                        </div>
                        <Skeleton className="h-12 w-full rounded-xl bg-slate-200" />
                    </div>

                    <Skeleton className="h-64 w-full rounded-2xl bg-slate-100" />
                </div>
            </div>
        </div>
    )
}
