"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ApiRequestError } from "@/lib/api/apiRequestError";
import { TaskAction } from "@/lib/api/tasks/taskStatus";
import {
  claimTaskRequest,
  createTaskRequest,
  startTaskRequest,
  submitTaskRequest,
  reviewTaskRequest,
  assignTaskRequest,
  createTaskCommentRequest,
  deleteTaskCommentRequest,
} from "@/lib/api/tasks/tasks";
import { createSwapRequestRequest } from "@/lib/api/tasks/swapRequests";
import { CreateSwapRequestPayload } from "@/types/task";
import { TaskFormState } from "@/lib/api/tasks/taskFormState";
import { validateCreateTaskFields } from "@/lib/validation/taskSchema";
import { projectRoutes, taskDetailRoute } from "@/lib/routes";

export type TransitionTaskState = {
  success: boolean;
  error: string | null;
};

export type TransitionTaskPayload = {
  note?: string;
  reviewNote?: string;
};

async function runTaskAction(
  taskId: number,
  action: TaskAction,
  cookie: string,
  payload?: TransitionTaskPayload,
) {
  switch (action) {
    case "claim":
      return claimTaskRequest(taskId, cookie);
    case "ongoing":
      return startTaskRequest(taskId, cookie);
    case "submit":
    case "resume":
      return submitTaskRequest(taskId, payload?.note, cookie);
    case "approve":
      return reviewTaskRequest(taskId, "approved", payload?.reviewNote, cookie);
    case "requestRevision":
      return reviewTaskRequest(taskId, "in_revision", payload?.reviewNote, cookie);
    case "reject":
      return reviewTaskRequest(taskId, "rejected", payload?.reviewNote, cookie);
  }
}

export async function transitionTaskAction(
  projectId: string,
  taskId: number,
  action: TaskAction,
  payload?: TransitionTaskPayload,
): Promise<TransitionTaskState> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    await runTaskAction(taskId, action, cookieHeader, payload);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: "Terjadi kesalahan tak terduga. Coba lagi.",
    };
  }

  revalidatePath(projectRoutes(projectId).TASK_BOARD);
  revalidatePath(taskDetailRoute(projectId, taskId));
  return { success: true, error: null };
}

export type AssignTaskState = {
  success: boolean;
  error: string | null;
};

export async function assignTaskAction(
  projectId: string,
  taskId: number,
  targetUserId: number,
): Promise<AssignTaskState> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    await assignTaskRequest(taskId, targetUserId, cookieHeader);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: "Terjadi kesalahan tak terduga. Coba lagi.",
    };
  }

  revalidatePath(projectRoutes(projectId).TASK_BOARD);
  revalidatePath(taskDetailRoute(projectId, taskId));
  return { success: true, error: null };
}

export type SwapRequestState = {
  success: boolean;
  error: string | null;
};

// Membuat permintaan tukar task. Backend mengirim notifikasi ke user yang
// diminta (requestedTo) begitu request dibuat — lihat catatan di
// SWAP_REQUEST_API_NEEDS.md untuk kontrak notifikasi yang diharapkan.
export async function createSwapRequestAction(
  projectId: string,
  taskId: number,
  payload: CreateSwapRequestPayload,
): Promise<SwapRequestState> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    await createSwapRequestRequest(taskId, payload, cookieHeader);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: "Terjadi kesalahan tak terduga. Coba lagi.",
    };
  }

  revalidatePath(projectRoutes(projectId).TASK_BOARD);
  revalidatePath(taskDetailRoute(projectId, taskId));
  return { success: true, error: null };
}

export async function createTaskAction(
  projectId: string,
  _prevState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const priority = String(formData.get("priority") ?? "");
  const deadline = String(formData.get("deadline") ?? "");
  const values = { title, description, priority, deadline };

  const fieldErrors = validateCreateTaskFields(title, deadline, priority);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: null, fieldErrors, values };
  }

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    await createTaskRequest(
      projectId,
      {
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority.trim() ? Number(priority) : undefined,
        deadline: deadline.trim() || undefined,
      },
      cookieHeader,
    );
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { success: false, error: err.message, values };
    }
    return {
      success: false,
      error: "Terjadi kesalahan tak terduga. Coba lagi.",
      values,
    };
  }

  revalidatePath(projectRoutes(projectId).TASK_BOARD);
  return { success: true, error: null };
}

export type CommentActionState = {
  success: boolean;
  error: string | null;
};

export async function createTaskCommentAction(
  projectId: string,
  taskId: number,
  _prevState: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const comment = String(formData.get("comment") ?? "").trim();

  if (!comment) {
    return { success: false, error: "Komentar tidak boleh kosong." };
  }
  if (comment.length > 1000) {
    return { success: false, error: "Komentar maksimal 1000 karakter." };
  }

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    await createTaskCommentRequest(taskId, comment, cookieHeader);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: "Terjadi kesalahan tak terduga. Coba lagi.",
    };
  }

  revalidatePath(taskDetailRoute(projectId, taskId));
  return { success: true, error: null };
}

export async function deleteTaskCommentAction(
  projectId: string,
  taskId: number,
  commentId: number,
): Promise<CommentActionState> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    await deleteTaskCommentRequest(commentId, cookieHeader);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: "Terjadi kesalahan tak terduga. Coba lagi.",
    };
  }

  revalidatePath(taskDetailRoute(projectId, taskId));
  return { success: true, error: null };
}