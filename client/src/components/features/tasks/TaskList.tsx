"use client";

import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { MyTask } from "@/types/task";
import TaskListCard from "@/components/features/tasks/TaskListCard";
import TaskSearchBar from "@/components/features/tasks/TaskSearchBar";
import TaskFilterBar from "@/components/features/tasks/TaskFilterBar";
import {
    DEFAULT_MY_TASK_FILTERS,
    DeadlineFilter,
    MyTaskFilters,
    getDeadlineBucket,
    matchesFilters,
} from "@/app/(main)/my-tasks/filters";

type TaskListProps = {
    tasks: MyTask[];
};

const SECTION_ORDER: DeadlineFilter[] = ["overdue", "upcoming", "later"];

const SECTION_LABEL: Record<DeadlineFilter, string> = {
    all: "",
    overdue: "Lewat tenggat",
    upcoming: "Mendekati tenggat",
    later: "Masih lama",
};

// Task tanpa deadline atau yang sudah selesai (approved/rejected) tidak
// masuk salah satu bucket di atas — ditampilkan di bagian ini.
const OTHER_LABEL = "Lainnya";

export default function TaskList({ tasks }: TaskListProps) {
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<MyTaskFilters>(DEFAULT_MY_TASK_FILTERS);

    const filteredTasks = useMemo(() => {
        const query = search.trim().toLowerCase();
        return tasks.filter((task) => {
            const matchesSearch = !query || task.title.toLowerCase().includes(query);
            return matchesSearch && matchesFilters(task, filters);
        });
    }, [tasks, search, filters]);

    const sections = useMemo(() => {
        const grouped = new Map<string, MyTask[]>();

        for (const task of filteredTasks) {
            const bucket = getDeadlineBucket(task) ?? OTHER_LABEL;
            const key = bucket === OTHER_LABEL ? OTHER_LABEL : SECTION_LABEL[bucket];
            grouped.set(key, [...(grouped.get(key) ?? []), task]);
        }

        const orderedKeys = [...SECTION_ORDER.map((bucket) => SECTION_LABEL[bucket]), OTHER_LABEL];
        return orderedKeys
            .filter((key) => grouped.has(key))
            .map((key) => ({ label: key, tasks: grouped.get(key)! }));
    }, [filteredTasks]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 md:items-start md:gap-4 lg:items-end">
                <div className="min-w-0 flex-1 lg:max-w-sm lg:flex-none">
                    <TaskSearchBar value={search} onChange={setSearch} />
                </div>
                <TaskFilterBar filters={filters} onChange={setFilters} />
            </div>

            {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                    <ClipboardList className="size-8 text-muted" />
                    <p className="font-inter text-sm text-muted">
                        {search || filters.status !== "all" || filters.deadline !== "all"
                            ? "Tugas tidak ditemukan"
                            : "Belum ada tugas"}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {sections.map((section) => (
                        <div key={section.label} className="flex flex-col gap-3">
                            <h3 className="font-inter text-sm font-semibold text-muted">
                                {section.label}
                                <span className="ml-1.5 font-normal">({section.tasks.length})</span>
                            </h3>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                                {section.tasks.map((task) => (
                                    <TaskListCard key={task.id} task={task} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}