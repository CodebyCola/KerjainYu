import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Task } from "@/types/task";
import { STATUS_STYLE, STATUS_LABEL } from "@/lib/api/tasks/taskStatus";
import { projectRoutes } from "@/lib/routes";
import { cn } from "@/utils/cn";

type TaskDetailHeaderProps = {
    task: Task;
    projectTitle: string;
    projectId: string;
};

export default function TaskDetailHeader({ task, projectTitle, projectId }: TaskDetailHeaderProps) {
    return (
        <div className="flex flex-col gap-3">
            <Link
                href={projectRoutes(projectId).TASK_BOARD}
                className="flex w-fit items-center gap-1.5 text-sm font-inter text-muted transition-colors hover:text-foreground"
            >
                Kembali ke papan tugas
            </Link>

            <div className="flex flex-col gap-1.5">
                <p className="text-sm font-inter text-muted">{projectTitle}</p>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <h1 className="font-inter text-xl font-semibold text-foreground md:text-2xl">
                        {task.title}
                    </h1>
                    <span
                        className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-xs font-inter font-medium",
                            STATUS_STYLE[task.status]
                        )}
                    >
                        {STATUS_LABEL[task.status]}
                    </span>
                </div>
            </div>
        </div>
    );
}
