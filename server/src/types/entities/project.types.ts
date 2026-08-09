export type ProjectStatus = 'ongoing' | 'completed';

export interface Project {
    id: number;
    title: string;
    status: ProjectStatus;
    allowFreeSwap: boolean;
    deadline: Date | null;
    isArchived: boolean;
    isArchivedAt: Date | null;
    createdAt: Date;
}