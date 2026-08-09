export type ProjectLinkCategory =
| 'design'
| 'development'
| 'docs'
| 'other';

export interface ProjectLink {
id: number;
project_id: number;
label: string;
url: string;
category: ProjectLinkCategory;
added_by: number | null;
created_at: Date;
}