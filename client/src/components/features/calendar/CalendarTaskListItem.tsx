import { CalendarDays } from "lucide-react";
import { Task } from "@/types/task";
import { STATUS_STYLE, STATUS_LABEL } from "@/lib/api/tasks/taskStatus";
import { isTaskOverdue, formatShortDayLabel } from "@/utils/calendar";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/getInitials";

type CalendarTaskListItemProps = {
    task: Task;
    onSelect: (task: Task) => void;
};

export default function CalendarTaskListItem({ task, onSelect }: CalendarTaskListItemProps) {
    const assignee = task.assignee;
    const overdue = isTaskOverdue(task);

    return (
        <button
            type="button"
            onClick={() => onSelect(task)}
            className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary"
        >
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="font-inter text-sm font-medium text-foreground">{task.title}</h4>
                    <span
                        className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-inter font-medium",
                            STATUS_STYLE[task.status]
                        )}
                    >
                        {STATUS_LABEL[task.status]}
                    </span>
                </div>

                <div className="mt-2 flex items-center gap-3">
                    {task.deadline && (
                        <span
                            className={cn(
                                "flex items-center gap-1 text-xs font-inter text-muted",
                                overdue && "font-medium text-status-blocked-text"
                            )}
                        >
                            <CalendarDays className="size-3.5" />
                            {formatShortDayLabel(new Date(task.deadline))}
                        </span>
                    )}

                    {assignee && (
                        <span className="flex items-center gap-1.5 text-xs font-inter text-muted">
                            <span className="flex size-5 items-center justify-center rounded-full bg-role-member-bg text-[9px] font-inter font-semibold text-role-member-text">
                                {getInitials(assignee.username)}
                            </span>
                            {assignee.username}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}