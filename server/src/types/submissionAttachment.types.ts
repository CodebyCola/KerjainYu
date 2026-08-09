export type AttachmentType =
| 'text'
| 'image'
| 'file'
| 'link';

export interface SubmissionAttachment {
id: number;
submission_id: number;
type: AttachmentType;
content: string;
created_at: Date;
}