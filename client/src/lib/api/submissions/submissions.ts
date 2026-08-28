import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import {
  PendingSubmission,
  ReviewSubmissionPayload,
  SubmissionAttachment,
  CreateUploadUrlPayload,
  CreateAttachmentPayload,
  TaskSubmission,
} from "@/types/task";
import { apiFetch } from "../fetcher";

function submissionPath(submissionId: number) {
  return `/submissions/${submissionId}`;
}

// PATCH /submissions/:id/review — leader approve/minta revisi/tolak.
export function reviewSubmissionRequest(
  submissionId: number,
  payload: ReviewSubmissionPayload,
  cookie: string,
) {
  return apiFetch<TaskSubmission>(`${submissionPath(submissionId)}/review`, {
    method: "PATCH",
    body: payload,
    cookie,
  });
}

// GET /projects/:id/pending-submissions — daftar submission menunggu review
// di sebuah project, khusus leader.
export function getPendingSubmissionsRequest(projectId: string, cookie: string) {
  return apiFetch<PendingSubmission[]>(`/projects/${projectId}/pending-submissions`, {
    cookie,
  });
}

export const getPendingSubmissions = cache(
  async (projectId: string): Promise<PendingSubmission[]> => {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    try {
      const { data } = await getPendingSubmissionsRequest(projectId, cookieHeader);
      return data;
    } catch {
      return [];
    }
  },
);

// GET /submissions/:id/attachments
export function getSubmissionAttachmentsRequest(submissionId: number, cookie: string) {
  return apiFetch<SubmissionAttachment[]>(`${submissionPath(submissionId)}/attachments`, {
    cookie,
  });
}

export const getSubmissionAttachments = cache(
  async (submissionId: number): Promise<SubmissionAttachment[]> => {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    try {
      const { data } = await getSubmissionAttachmentsRequest(submissionId, cookieHeader);
      return data;
    } catch {
      return [];
    }
  },
);

// POST /submissions/:id/attachments/upload-url — minta presigned URL untuk
// upload file/gambar langsung ke storage (S3/MinIO) dari browser.
export function createAttachmentUploadUrlRequest(
  submissionId: number,
  payload: CreateUploadUrlPayload,
  cookie: string,
) {
  return apiFetch<{ uploadUrl: string; objectKey: string }>(
    `${submissionPath(submissionId)}/attachments/upload-url`,
    {
      method: "POST",
      body: payload,
      cookie,
    },
  );
}

// POST /submissions/:id/attachments — simpan metadata attachment (text/link
// atau file yang objectKey-nya sudah diupload lewat presigned URL di atas).
export function createAttachmentRequest(
  submissionId: number,
  payload: CreateAttachmentPayload,
  cookie: string,
) {
  return apiFetch<{
    contentAttachment: SubmissionAttachment | null;
    fileAttachment: SubmissionAttachment | null;
  }>(`${submissionPath(submissionId)}/attachments`, {
    method: "POST",
    body: payload,
    cookie,
  });
}

// DELETE /submissions/:id/attachments/:attachmentId
export function deleteSubmissionAttachmentRequest(
  submissionId: number,
  attachmentId: number,
  cookie: string,
) {
  return apiFetch<null>(`${submissionPath(submissionId)}/attachments/${attachmentId}`, {
    method: "DELETE",
    cookie,
  });
}

// GET /submissions/:id/attachments/:attachmentId/download-url — presigned
// URL untuk membuka/download file attachment (tipe file/image saja).
export function getAttachmentDownloadUrlRequest(
  submissionId: number,
  attachmentId: number,
  cookie: string,
) {
  return apiFetch<{ downloadUrl: string; fileName: string; mimeType: string }>(
    `${submissionPath(submissionId)}/attachments/${attachmentId}/download-url`,
    { cookie },
  );
}
