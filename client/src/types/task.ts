export type TaskStatus =
  | "unclaimed"
  | "todo"
  | "ongoing"
  | "submitted"
  | "in_revision"
  | "approved"
  | "rejected";

export type TaskAssignee = {
  id: number;
  username: string;
  avatarUrl: string | null;
};

export type SubmissionReviewStatus =
  | "pending"
  | "approved"
  | "revision_requested"
  | "rejected";

// Row task_submissions terakhir untuk sebuah task — dipakai di halaman detail
// untuk menampilkan catatan submit assignee & catatan review leader.
export type TaskSubmission = {
  id: number;
  taskId: number;
  submittedBy: number;
  note: string | null;
  reviewStatus: SubmissionReviewStatus;
  reviewNote: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  submittedAt: string;
};

// Item dari GET /projects/:id/pending-submissions — join task_submissions +
// tasks, dipakai di halaman "Submission Menunggu Review" level project.
export type PendingSubmission = TaskSubmission & {
  taskTitle: string;
};

export type SubmissionAttachmentType = "text" | "image" | "file" | "link";

export type SubmissionAttachment = {
  id: number;
  submissionId: number;
  type: SubmissionAttachmentType;
  content: string | null;
  objectKey: string | null;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  createdAt: string;
};

// Payload untuk POST /tasks/:id/submissions.
export type CreateSubmissionPayload = {
  note?: string;
  contents: Array<{ type: "text" | "link"; content: string }>;
};

// Payload untuk PATCH /submissions/:id/review.
export type ReviewSubmissionPayload = {
  reviewStatus: "approved" | "revision_requested" | "rejected";
  reviewNote?: string;
};

// Payload untuk POST /submissions/:id/attachments/upload-url.
export type CreateUploadUrlPayload = {
  type: "file" | "image";
  fileName: string;
  mimeType: string;
  fileSize: number;
};

// Payload untuk POST /submissions/:id/attachments — persis satu dari
// content/file yang harus diisi, sisanya null (lihat createAttachmentSchema).
export type CreateAttachmentPayload = {
  content: { type: "text" | "link"; content: string } | null;
  file: {
    type: "file" | "image";
    objectKey: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  } | null;
};

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number | null;
  displayOrder: number;
  projectId: number;
  deadline: string | null;
  assigneeId?: number | null;
  assignee?: TaskAssignee | null;
  createdBy: number;
  isClaimable: boolean;
  createdAt: string;
  updatedAt: string | null;
};

// Task detail = Task + submission terakhir (kalau ada), dipakai di
// task-board/[id] untuk menampilkan catatan submit/review.
export type TaskDetail = Task & {
  latestSubmission: TaskSubmission | null;
};

export type TaskComment = {
  id: number;
  taskId: number;
  comment: string;
  createdAt: string;
  userId: number;
  username: string;
  avatarUrl: string | null;
};

// --- Task Swap Request ---
// Status "pending" = menunggu respons requestedTo (atau leader kalau project
// tidak allowFreeSwap). "approved"/"rejected" = sudah direspons. "cancelled"
// = dibatalkan sendiri oleh requestedBy sebelum direspons.
export type TaskSwapRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export type TaskSwapRequest = {
  id: number;
  taskId: number;
  targetTaskId: number | null;
  requestedBy: number;
  requestedTo: number;
  status: TaskSwapRequestStatus;
  resolvedBy: number | null;
  resolvedAt: string | null;
  createdAt: string;
};

// Payload untuk membuat swap request baru dari task detail.
export type CreateSwapRequestPayload = {
  requestedTo: number;
  targetTaskId?: number;
};

// Bentuk item dari GET /swap-requests/incoming & /outgoing — hasil join di
// server, dipakai buat menampilkan notifikasi tukar task.
export type TaskSwapRequestListItem = {
  id: number;
  status: TaskSwapRequestStatus;
  task: { id: number; title: string; projectId: number };
  targetTask: { id: number; title: string } | null;
  requestedBy: { id: number; username: string };
  requestedTo: { id: number; username: string };
  resolvedBy: number | null;
  resolvedAt: string | null;
  createdAt: string;
};

// Task + nama proyeknya, buat ditampilkan di card "My Tasks" tanpa
// komponen perlu join manual ke daftar project setiap kali render.
export type MyTask = Task & {
  projectTitle: string;
};