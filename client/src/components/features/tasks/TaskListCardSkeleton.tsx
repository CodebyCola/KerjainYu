import Skeleton from "@/components/ui/Skeleton";

export default function TaskListCardSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-5 w-3/4 sm:h-6" />
                <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
            </div>

            {/* Meta */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    );
}
