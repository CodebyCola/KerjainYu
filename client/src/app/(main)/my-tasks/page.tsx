import TaskList from "@/components/features/tasks/TaskList";
import { getMyTasks } from "@/lib/api/tasks/tasks";

export default async function MyTasks() {
    const tasks = await getMyTasks();

    return (
        <>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">Tugas Saya</h2>
            <div className="mt-4">
                <TaskList tasks={tasks} />
            </div>
        </>
    );
}

