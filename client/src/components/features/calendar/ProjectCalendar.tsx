"use client";

import { useMemo, useState } from "react";
import { Task } from "@/types/task";
import {
    getMonthGrid,
    groupTasksByDate,
    getTasksForDay,
    getTasksWithoutDeadline,
    addMonths,
    subMonths,
} from "@/utils/calendar";
import CalendarMonthGrid from "@/components/features/calendar/CalendarMonthGrid";
import CalendarDayAgenda from "@/components/features/calendar/CalendarDayAgenda";
import CalendarUnscheduledSection from "@/components/features/calendar/CalendarUnscheduledSection";
import CalendarTaskDetailModal from "@/components/features/calendar/CalendarTaskDetailModal";

type ProjectCalendarProps = {
    projectId: string;
    tasks: Task[];
};

export default function ProjectCalendar({ projectId, tasks }: ProjectCalendarProps) {
    const [monthAnchor, setMonthAnchor] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const days = useMemo(() => getMonthGrid(monthAnchor), [monthAnchor]);
    const tasksByDate = useMemo(() => groupTasksByDate(tasks), [tasks]);
    const unscheduledTasks = useMemo(() => getTasksWithoutDeadline(tasks), [tasks]);
    const selectedDayTasks = useMemo(
        () => (selectedDate ? getTasksForDay(tasksByDate, selectedDate) : []),
        [tasksByDate, selectedDate]
    );

    return (
        <div className="flex flex-col gap-5">
            <CalendarMonthGrid
                monthAnchor={monthAnchor}
                days={days}
                tasksByDate={tasksByDate}
                selectedDate={selectedDate}
                onPrevMonth={() => setMonthAnchor((current) => subMonths(current, 1))}
                onNextMonth={() => setMonthAnchor((current) => addMonths(current, 1))}
                onSelectDay={setSelectedDate}
                onSelectTask={setSelectedTask}
            />

            <CalendarDayAgenda
                selectedDate={selectedDate}
                tasks={selectedDayTasks}
                onSelectTask={setSelectedTask}
            />

            <CalendarUnscheduledSection tasks={unscheduledTasks} onSelectTask={setSelectedTask} />

            <CalendarTaskDetailModal
                task={selectedTask}
                projectId={projectId}
                onClose={() => setSelectedTask(null)}
            />
        </div>
    );
}