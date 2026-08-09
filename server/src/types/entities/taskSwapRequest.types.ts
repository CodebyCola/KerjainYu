export type SwapRequestStatus =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'cancelled';

export interface TaskSwapRequest {
    id: number;
    taskId: number;
    targetTaskId: number | null;
    requestedBy: number;
    requestedTo: number;
    status: SwapRequestStatus;
    resolvedBy: number | null;
    resolvedAt: Date | null;
    createdAt: Date;
}