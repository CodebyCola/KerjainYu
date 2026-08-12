import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { MyTask } from "@/types/task";
import { apiFetch } from "../fetcher";

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
