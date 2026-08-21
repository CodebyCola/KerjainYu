import Skeleton from "@/components/ui/Skeleton";
import ArchiveProjectCardSkeleton from "@/components/features/archive/ArchiveProjectCardSkeleton";

export default function ArchiveLoading() {
    return (
        <>
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">Arsip Proyek</h2>
            </div>
            <Skeleton className="mt-2 h-4 w-64 max-w-full" />

            <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-4">
                <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-full" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <ArchiveProjectCardSkeleton key={index} />
                ))}
            </div>
        </>
    );
}
