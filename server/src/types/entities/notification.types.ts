export type NotificationType =
    | 'deadline_reminder'
    | 'task_assigned'
    | 'task_swapped'
    | 'swap_requested'
    | 'submission_pending'
    | 'submission_reviewed'
    | 'comment_added'
    | 'appeal_updated'
    | 'member_added'
    | 'member_invited';

export interface Notification {
    id: number;
    userId: number;
    type: NotificationType;
    referenceType: string | null;
    referenceId: number | null;
    message: string;
    isRead: boolean;
    createdAt: Date;
}