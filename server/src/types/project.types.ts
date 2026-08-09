export type ProjectStatus = 'ongoing' | 'completed';

export interface Project {
id: number;
title: string;
status: ProjectStatus;
allow_free_swap: boolean;
deadline: Date | null;
is_archived: boolean;
is_archived_at: Date | null;
created_at: Date;
}