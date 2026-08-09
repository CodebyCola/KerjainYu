export type OwnershipChangeReason =
| 'assigned'
| 'claimed'
| 'swap'
| 'reassigned';

export interface TaskOwnershipLog {
id: number;
task_id: number;
from_user_id: number | null;
to_user_id: number;
reason: OwnershipChangeReason;
changed_at: Date;
}