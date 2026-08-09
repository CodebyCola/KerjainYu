export type ReviewStatus =
| 'pending'
| 'approved'
| 'revision_requested'
| 'rejected';

export interface TaskSubmission {
id: number;
task_id: number;
submitted_by: number;
note: string | null;
review_status: ReviewStatus;
review_note: string | null;
reviewed_by: number | null;
reviewed_at: Date | null;
submitted_at: Date;
}