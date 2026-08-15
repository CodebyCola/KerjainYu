import { getProjectTasks } from "@/lib/api/tasks/tasks";
import { getProjectMembers } from "@/lib/api/members/members";
import ProjectCalendar from "@/components/features/calendar/ProjectCalendar";

type CalendarPageProps = {
    params: Promise<{ projectId: string }>;
};

export default async function CalendarPage({ params }: CalendarPageProps) {
    const { projectId } = await params;

    const [tasks, members] = await Promise.all([
        getProjectTasks(projectId),
        getProjectMembers(projectId),
    ]);

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold md:text-2xl lg:text-3xl">Kalender Penugasan</h2>
            <ProjectCalendar projectId={projectId} tasks={tasks} members={members} />
        </div>
    );
}
