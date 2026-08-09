export type SwapRequestStatus =
| 'pending'
| 'approved'
| 'rejected'
| 'cancelled';

export interface TaskSwapRequest {
id: number;
task_id: number;
target_task_id: number | null;
requested_by: number;
requested_to: number;
status: SwapRequestStatus;
resolved_by: number | null;
resolved_at: Date | null;
created_at: Date;
}