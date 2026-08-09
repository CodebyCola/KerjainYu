export type TaskStatus =
    | 'unclaimed'
    | 'todo'
    | 'ongoing'
    | 'submitted'
    | 'in_revision'
    | 'approved'
    | 'rejected';

export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: number | null;
    displayOrder: number;
    projectId: number;
    deadline: Date | null;
    assigneeId: number | null;
    createdBy: number;
    isClaimable: boolean;
    createdAt: Date;
    updatedAt: Date | null;
}