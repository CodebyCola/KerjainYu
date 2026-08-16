import { CalendarDays } from "lucide-react";
import { Task } from "@/types/task";
import { formatDayLabel } from "@/utils/calendar";
import CalendarTaskListItem from "@/components/features/calendar/CalendarTaskListItem";

type CalendarDayAgendaProps = {
    selectedDate: Date | null;
    tasks: Task[];
    onSelectTask: (task: Task) => void;
};

export default function CalendarDayAgenda({ selectedDate, tasks, onSelectTask }: CalendarDayAgendaProps) {
    if (!selectedDate) {
        return (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center sm:hidden">
                <CalendarDays className="size-6 text-muted" />
                <p className="text-sm font-inter text-muted">Pilih tanggal untuk lihat tugasnya</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2.5 sm:hidden">
            <h3 className="font-inter text-sm font-semibold capitalize text-foreground">
                {formatDayLabel(selectedDate)}
            </h3>

            {tasks.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border py-6 text-center text-sm font-inter text-muted">
                    Tidak ada tugas dengan tenggat di tanggal ini.
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {tasks.map((task) => (
                        <CalendarTaskListItem key={task.id} task={task} onSelect={onSelectTask} />
                    ))}
                </div>
            )}
        </div>
    );
}