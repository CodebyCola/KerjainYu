import Skeleton from "@/components/ui/Skeleton";

export default function TaskDetailLoading() {
    return (
        <div className="flex flex-col gap-4 pb-6">
            <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-28" />
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-6 w-56" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-2.5">
                            <Skeleton className="size-8 shrink-0 rounded-lg" />
                            <div className="flex flex-col gap-1">
                                <Skeleton className="h-3 w-14" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
                <Skeleton className="h-4 w-12" />
                <div className="mt-3 flex gap-2">
                    <Skeleton className="h-11 w-28 rounded-lg" />
                    <Skeleton className="h-11 w-28 rounded-lg" />
                </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full rounded-lg" />
            </div>
        </div>
    );
}
