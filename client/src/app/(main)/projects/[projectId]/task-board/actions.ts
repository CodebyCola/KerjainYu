"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api/fetcher";
import { ApiRequestError } from "@/lib/api/apiRequestError";
import { Task } from "@/types/task";
import { TaskAction } from "@/lib/api/tasks/taskStatus";
import { createTaskRequest } from "@/lib/api/tasks/tasks";
import { TaskFormState } from "@/lib/api/tasks/taskFormState";
import { validateCreateTaskFields } from "@/lib/validation/taskSchema";
import { projectRoutes } from "@/lib/routes";

export type TransitionTaskState = {
  success: boolean;
  error: string | null;
};

const ACTION_PATH: Record<TaskAction, string> = {
  claim: "claim",
  start: "start",
  submit: "submit",
  resume: "start",
  approve: "review",
  requestRevision: "review",
  reject: "review",
};

function buildBody(action: TaskAction): Record<string, string> | undefined {
  if (action === "approve") return { decision: "approved" };
  if (action === "requestRevision") return { decision: "in_revision" };
  if (action === "reject") return { decision: "rejected" };
  return undefined;
}

export async function transitionTaskAction(
  projectId: string,
  taskId: number,
  action: TaskAction,
): Promise<TransitionTaskState> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    await apiFetch<Task>(`/tasks/${taskId}/${ACTION_PATH[action]}`, {
      method: "POST",
      body: buildBody(action),
      cookie: cookieHeader,
    });
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
