import { Task } from "@/types/task";
import { CalendarDay } from "@/utils/calendar";
import { cn } from "@/utils/cn";
import CalendarTaskChip from "@/components/features/calendar/CalendarTaskChip";

type CalendarDayCellProps = {
    day: CalendarDay;
    tasks: Task[];
    isSelected: boolean;
    onSelectDay: (date: Date) => void;
    onSelectTask: (task: Task) => void;
};

const MAX_VISIBLE_CHIPS = 3;

export default function CalendarDayCell({ day, tasks, isSelected, onSelectDay, onSelectTask }: CalendarDayCellProps) {
    const visibleTasks = tasks.slice(0, MAX_VISIBLE_CHIPS);
    const overflowCount = tasks.length - visibleTasks.length;

    return (
        <div
            className={cn(
                "flex min-h-14 flex-col items-stretch gap-1 rounded-lg border p-1 transition-colors sm:min-h-24 sm:p-1.5",
                day.isCurrentMonth ? "border-border bg-card" : "border-transparent bg-transparent opacity-40",
                isSelected && "border-primary ring-1 ring-primary"
            )}
        >
            <button
                type="button"
                onClick={() => onSelectDay(day.date)}
                aria-pressed={isSelected}
                aria-label={`Pilih tanggal ${day.date.getDate()}`}
                className="flex items-center justify-center gap-1 sm:justify-start"
            >
                <span
                    className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-inter font-medium",
                        day.isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                    )}
                >
                    {day.date.getDate()}
                </span>
            </button>

            {tasks.length > 0 && (
                <>
                    <button
                        type="button"
                        onClick={() => onSelectDay(day.date)}
                        aria-label={`${tasks.length} tugas pada tanggal ${day.date.getDate()}`}
                        className="flex items-center justify-center gap-0.5 sm:hidden"
                    >
                        {tasks.slice(0, 4).map((task) => (
                            <span key={task.id} className="size-1.5 rounded-full bg-primary" />
                        ))}
                    </button>

                    <div className="hidden flex-col gap-0.5 sm:flex">
                        {visibleTasks.map((task) => (
                            <CalendarTaskChip key={task.id} task={task} onSelect={onSelectTask} />
                        ))}
                        {overflowCount > 0 && (
                            <button
                                type="button"
                                onClick={() => onSelectDay(day.date)}
                                className="px-1.5 text-left text-[11px] font-inter text-muted hover:text-foreground"
                            >
                                +{overflowCount} lagi
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
