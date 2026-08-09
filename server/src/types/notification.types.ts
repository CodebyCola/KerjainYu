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
user_id: number;
type: NotificationType;
reference_type: string | null;
reference_id: number | null;
message: string;
is_read: boolean;
created_at: Date;
}