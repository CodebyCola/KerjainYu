import Skeleton from "@/components/ui/Skeleton";

export default function ProjectOverviewLoading() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-7 w-48 sm:h-8" />
                <Skeleton className="h-4 w-full max-w-md" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="rounded-xl border border-border bg-card p-4 sm:p-5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="mt-3 h-7 w-16" />
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <Skeleton className="h-5 w-32" />
                <div className="mt-4 flex flex-col gap-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        </div>
    );
}
