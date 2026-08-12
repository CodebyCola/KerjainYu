export type TaskStatus =
    | "unclaimed"
    | "todo"
    | "ongoing"
    | "submitted"
    | "in_revision"
    | "approved"
    | "rejected";

export type Task = {
    id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: number | null;
    displayOrder: number;
    projectId: number;
    deadline: string | null;
    assigneeId: number | null;
    createdBy: number;
    isClaimable: boolean;
    createdAt: string;
    updatedAt: string | null;
};

// Task + nama proyeknya, buat ditampilkan di card "My Tasks" tanpa
// komponen perlu join manual ke daftar project setiap kali render.
export type MyTask = Task & {
    projectTitle: string;
};
