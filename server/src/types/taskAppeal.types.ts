export type AppealStatus =
| 'pending'
| 'accepted'
| 'rejected';

export interface TaskAppeal {
id: number;
task_id: number;
submission_id: number | null;
raised_by: number;
reason: string;
status: AppealStatus;
resolved_by: number | null;
resolution_note: string | null;
created_at: Date;
resolved_at: Date | null;
}