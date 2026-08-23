import "server-only";
import { CreateSwapRequestPayload, TaskSwapRequest } from "@/types/task";
import { apiFetch } from "../fetcher";


function taskSwapRequestsPath(taskId: number) {
  return `/tasks/${taskId}/swap-requests`;
}

function swapRequestPath(swapRequestId: number) {
  return `/swap-requests/${swapRequestId}`;
}

export function createSwapRequestRequest(
  taskId: number,
  payload: CreateSwapRequestPayload,
  cookie: string,
) {
  return apiFetch<TaskSwapRequest>(taskSwapRequestsPath(taskId), {
    method: "POST",
    body: payload,
    cookie,
  });
}

export function respondSwapRequestRequest(
  swapRequestId: number,
  status: "approved" | "rejected",
  cookie: string,
) {
  return apiFetch<null>(`${swapRequestPath(swapRequestId)}/respond`, {
    method: "PATCH",
    body: { status },
    cookie,
  });
}

export function cancelSwapRequestRequest(swapRequestId: number, cookie: string) {
  return apiFetch<null>(`${swapRequestPath(swapRequestId)}/cancel`, {
    method: "PATCH",
    cookie,
  });
}
