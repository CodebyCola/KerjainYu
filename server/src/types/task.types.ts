export type TaskStatus =
| 'unclaimed'
| 'todo'
| 'ongoing'
| 'submitted'
| 'in_revision'
| 'approved'
| 'rejected';

export interface Task {
id: number;
title: string;
description: string | null;
status: TaskStatus;
priority: number | null;
display_order: number;
project_id: number;
deadline: Date | null;
assignee_id: number | null;
created_by: number;
is_claimable: boolean;
created_at: Date;
updated_at: Date | null;
}