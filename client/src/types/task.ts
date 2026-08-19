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

// Task + nama proyeknya, buat ditampilkan di card "My Tasks" tanpa
// komponen perlu join manual ke daftar project setiap kali render.
export type MyTask = Task & {
  projectTitle: string;
};