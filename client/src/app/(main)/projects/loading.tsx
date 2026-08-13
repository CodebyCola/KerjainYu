import Skeleton from "@/components/ui/Skeleton";
import ProjectListCardSkeleton from "@/components/features/projects/ProjectListCardSkeleton";

export default function ProjectsLoading() {
    return (
        <>
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">Daftar Proyek</h2>
                <Skeleton className="h-10 w-32 rounded-lg sm:w-36" />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-4">
                <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
                <Skeleton className="h-10 w-24 rounded-lg" />
                <Skeleton className="h-10 w-24 rounded-lg" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <ProjectListCardSkeleton key={index} />
                ))}
            </div>
        </>
    );
}
