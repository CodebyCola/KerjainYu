export type OwnershipChangeReason =
    | 'assigned'
    | 'claimed'
    | 'swap'
    | 'reassigned';

export interface TaskOwnershipLog {
    id: number;
    taskId: number;
    fromUserId: number | null;
    toUserId: number;
    reason: OwnershipChangeReason;
    changedAt: Date;
}