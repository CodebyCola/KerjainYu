import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { MyTask, Task } from "@/types/task";
import { apiFetch } from "../fetcher";
import { getDummyProjectTasks } from "@/app/(main)/projects/[projectId]/task-board/dataDummy";

const MY_TASKS_PATH = "/task/me";

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

export function getProjectTasksRequest(projectId: string, cookie: string) {
  return apiFetch<Task[]>(projectTasksPath(projectId), { cookie });
}

export const getProjectTasks = cache(async (projectId: string): Promise<Task[]> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const { data } = await getProjectTasksRequest(projectId, cookieHeader);
    return data;
  } catch {
    return getDummyProjectTasks(Number(projectId));
  }
});

