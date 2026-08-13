import Skeleton from "@/components/ui/Skeleton";

export default function ProjectListCardSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-5 w-2/3 sm:h-6" />
                <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
            </div>

            {/* Meta */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                    <Skeleton className="size-7 rounded-full border-2 border-card sm:size-8" />
                    <Skeleton className="size-7 rounded-full border-2 border-card sm:size-8" />
                    <Skeleton className="size-7 rounded-full border-2 border-card sm:size-8" />
                </div>
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    );
}
