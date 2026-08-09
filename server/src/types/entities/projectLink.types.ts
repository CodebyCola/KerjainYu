export type ProjectLinkCategory =
    | 'design'
    | 'development'
    | 'docs'
    | 'other';

export interface ProjectLink {
    id: number;
    projectId: number;
    label: string;
    url: string;
    category: ProjectLinkCategory;
    addedby: number | null;
    createdAt: Date;
}