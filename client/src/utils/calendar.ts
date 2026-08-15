import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    isBefore,
    format,
    addMonths,
    subMonths,
} from "date-fns";
import { id } from "date-fns/locale";
import { Task } from "@/types/task";

export type CalendarDay = {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
};

export function getMonthGrid(monthAnchor: Date): CalendarDay[] {
    const monthStart = startOfMonth(monthAnchor);
    const monthEnd = endOfMonth(monthAnchor);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => ({
        date,
        isCurrentMonth: isSameMonth(date, monthAnchor),
        isToday: isToday(date),
    }));
}

export function groupTasksByDate(tasks: Task[]): Map<string, Task[]> {
    const grouped = new Map<string, Task[]>();

    for (const task of tasks) {
        if (!task.deadline) continue;
        const key = format(new Date(task.deadline), "yyyy-MM-dd");
        const existing = grouped.get(key);
        if (existing) {
            existing.push(task);
        } else {
            grouped.set(key, [task]);
        }
    }

    return grouped;
}

export function getTasksForDay(tasksByDate: Map<string, Task[]>, date: Date): Task[] {
    return tasksByDate.get(format(date, "yyyy-MM-dd")) ?? [];
}

export function getTasksWithoutDeadline(tasks: Task[]): Task[] {
    return tasks.filter((task) => !task.deadline);
}

export function isTaskOverdue(task: Task): boolean {
    if (!task.deadline) return false;
    if (task.status === "approved" || task.status === "rejected") return false;
    return isBefore(new Date(task.deadline), new Date()) && !isToday(new Date(task.deadline));
}

export function formatMonthLabel(date: Date): string {
    return format(date, "MMMM yyyy", { locale: id });
}

export function formatDayLabel(date: Date): string {
    return format(date, "EEEE, d MMMM yyyy", { locale: id });
}

export function formatShortDayLabel(date: Date): string {
    return format(date, "d MMM", { locale: id });
}

export { addMonths, subMonths, isSameDay, isToday };

export const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
