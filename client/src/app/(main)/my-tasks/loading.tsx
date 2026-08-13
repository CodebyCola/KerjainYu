import Skeleton from "@/components/ui/Skeleton";
import TaskListCardSkeleton from "@/components/features/tasks/TaskListCardSkeleton";

const SECTIONS = [
    { label: "Lewat tenggat", count: 2 },
    { label: "Mendekati tenggat", count: 3 },
    { label: "Masih lama", count: 4 },
];

export default function MyTasksLoading() {
    return (
        <>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">Tugas Saya</h2>

            <div className="mt-4 flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
                </div>

                <div className="flex flex-col gap-6">
                    {SECTIONS.map((section) => (
                        <div key={section.label} className="flex flex-col gap-3">
                            <Skeleton className="h-4 w-32" />
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                                {Array.from({ length: section.count }).map((_, index) => (
                                    <TaskListCardSkeleton key={index} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
