import { ListTodo } from "lucide-react";
import { Task } from "@/types/task";
import CalendarTaskListItem from "@/components/features/calendar/CalendarTaskListItem";

type CalendarUnscheduledSectionProps = {
    tasks: Task[];
    onSelectTask: (task: Task) => void;
};

export default function CalendarUnscheduledSection({ tasks, onSelectTask }: CalendarUnscheduledSectionProps) {
    if (tasks.length === 0) return null;

    return (
        <div className="flex flex-col gap-2.5 mb-10">
            <h3 className="flex items-center gap-2 font-inter text-sm font-semibold text-foreground">
                <ListTodo className="size-4 text-muted" />
                Tanpa tenggat
                <span className="rounded-full bg-status-todo-bg px-2 py-0.5 text-xs font-inter font-medium text-status-todo-text">
                    {tasks.length}
                </span>
            </h3>

            <div className="flex flex-col gap-2">
                {tasks.map((task) => (
                    <CalendarTaskListItem key={task.id} task={task} onSelect={onSelectTask} />
                ))}
            </div>
        </div>
    );
}