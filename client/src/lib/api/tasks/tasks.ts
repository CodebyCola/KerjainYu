import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { MyTask, Task } from "@/types/task";
import { apiFetch } from "../fetcher";

const MY_TASKS_PATH = "/tasks";

export function getMyTasksRequest(cookie: string) {
  return apiFetch<MyTask[]>(MY_TASKS_PATH, { cookie });
}

export const getMyTasks = cache(async (): Promise<MyTask[]> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const { data } = await getMyTasksRequest(cookieHeader);
    return data;
  } catch {
    return [];
  }
});

function projectTasksPath(projectId: string) {
  return `/projects/${projectId}/tasks`;
}

function taskPath(taskId: number) {
  return `/tasks/${taskId}`;
}

export function getProjectTasksRequest(projectId: string, cookie: string) {
  return apiFetch<Task[]>(projectTasksPath(projectId), { cookie });
}

export const getProjectTasks = cache(
  async (projectId: string): Promise<Task[]> => {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    try {
      const { data } = await getProjectTasksRequest(projectId, cookieHeader);
      return data;
    } catch {
      return [];
    }
  },
);

export type CreateTaskPayload = {
  title: string;
  description?: string;
  priority?: number;
  deadline?: string;
};

export function createTaskRequest(
  projectId: string,
  payload: CreateTaskPayload,
  cookie: string,
) {
  return apiFetch<Task>(projectTasksPath(projectId), {
    method: "POST",
    body: payload,
    cookie,
  });
}

export function claimTaskRequest(taskId: number, cookie: string) {
  return apiFetch<Task>(`${taskPath(taskId)}/claim`, {
    method: "PATCH",
    cookie,
  });
}
