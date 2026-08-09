export type AttachmentType =
    | 'text'
    | 'image'
    | 'file'
    | 'link';

export interface SubmissionAttachment {
    id: number;
    submissionId: number;
    type: AttachmentType;
    content: string;
    createdAt: Date;
}