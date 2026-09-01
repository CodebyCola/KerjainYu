import Skeleton from "@/components/ui/Skeleton";

export default function ProfileLoading() {
    return (
        <div className="flex flex-col gap-5 pb-8">
            <div className="flex items-center gap-3.5 sm:gap-4">
                <Skeleton className="size-16 shrink-0 rounded-full sm:size-20" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Skeleton className="h-6 w-40 max-w-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>

            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-border bg-card p-4 sm:p-5">
                    <div className="flex items-start gap-2.5">
                        <Skeleton className="mt-0.5 size-4.5 shrink-0 rounded" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="mt-2 h-3 w-56 max-w-full" />
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-4">
                        <Skeleton className="h-11 w-full rounded-lg" />
                        <Skeleton className="h-11 w-full rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}
