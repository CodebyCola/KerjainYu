import { Task } from "@/types/task";
import { STATUS_STYLE } from "@/lib/api/tasks/taskStatus";
import { cn } from "@/utils/cn";

type CalendarTaskChipProps = {
    task: Task;
    onSelect: (task: Task) => void;
};

export default function CalendarTaskChip({ task, onSelect }: CalendarTaskChipProps) {
    return (
        <button
            type="button"
            onClick={() => onSelect(task)}
            title={task.title}
            className={cn(
                "w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-inter font-medium transition-opacity hover:opacity-80",
                STATUS_STYLE[task.status]
            )}
        >
            {task.title}
        </button>
    );
}
