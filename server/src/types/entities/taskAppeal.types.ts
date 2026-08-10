export type AppealStatus =
    | 'pending'
    | 'accepted'
    | 'rejected';

export interface TaskAppeal {
    id: number;
    taskId: number;
    submissionId: number | null;
    raisedBy: number;
    reason: string;
    status: AppealStatus;
    resolvedBy: number | null;
    resolutionNote: string | null;
    createdAt: Date;
    resolvedAt: Date | null;
}