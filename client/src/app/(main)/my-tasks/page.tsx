import TaskList from "@/components/features/tasks/TaskList";
import { dummyMyTasks } from "./dataDummy";

export default function MyTasks() {
    return (
        <>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">Tugas Saya</h2>
            <div className="mt-4">
                <TaskList tasks={dummyMyTasks} />
            </div>
        </>
    );
}
