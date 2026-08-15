import { ChevronLeft, ChevronRight } from "lucide-react";
import { Task } from "@/types/task";
import {
    CalendarDay,
    WEEKDAY_LABELS,
    formatMonthLabel,
    getTasksForDay,
    isSameDay,
} from "@/utils/calendar";
import CalendarDayCell from "@/components/features/calendar/CalendarDayCell";

type CalendarMonthGridProps = {
    monthAnchor: Date;
    days: CalendarDay[];
    tasksByDate: Map<string, Task[]>;
    selectedDate: Date | null;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onSelectDay: (date: Date) => void;
    onSelectTask: (task: Task) => void;
};

export default function CalendarMonthGrid({
    monthAnchor,
    days,
    tasksByDate,
    selectedDate,
    onPrevMonth,
    onNextMonth,
    onSelectDay,
    onSelectTask,
}: CalendarMonthGridProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
            <div className="flex items-center justify-between pb-3">
                <h3 className="font-inter text-sm font-semibold capitalize text-foreground sm:text-base">
                    {formatMonthLabel(monthAnchor)}
                </h3>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onPrevMonth}
                        aria-label="Bulan sebelumnya"
                        className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-status-todo-bg hover:text-foreground"
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onNextMonth}
                        aria-label="Bulan berikutnya"
                        className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-status-todo-bg hover:text-foreground"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 pb-1.5 sm:gap-1.5">
                {WEEKDAY_LABELS.map((label) => (
                    <span
                        key={label}
                        className="text-center text-[11px] font-inter font-medium text-muted sm:text-xs"
                    >
                        {label}
                    </span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {days.map((day) => (
                    <CalendarDayCell
                        key={day.date.toISOString()}
                        day={day}
                        tasks={getTasksForDay(tasksByDate, day.date)}
                        isSelected={selectedDate !== null && isSameDay(day.date, selectedDate)}
                        onSelectDay={onSelectDay}
                        onSelectTask={onSelectTask}
                    />
                ))}
            </div>
        </div>
    );
}
