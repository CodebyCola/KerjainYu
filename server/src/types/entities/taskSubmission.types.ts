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
    reviewStatus: ReviewStatus;
    reviewNote: string | null;
    reviewedBy: number | null;
    reviewedAt: Date | null;
    submittedAt: Date;
}