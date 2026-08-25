import "server-only";
import { cookies } from "next/headers";
import { CreateSwapRequestPayload, TaskSwapRequest, TaskSwapRequestListItem } from "@/types/task";
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

// GET /api/v1/swap-requests/incoming — permintaan tukar yang menunggu respons kita.
export function getIncomingSwapRequestsRequest(cookie: string) {
  return apiFetch<TaskSwapRequestListItem[]>("/swap-requests/incoming", { cookie });
}

// GET /api/v1/swap-requests/outgoing — permintaan tukar yang kita ajukan sendiri.
export function getOutgoingSwapRequestsRequest(cookie: string) {
  return apiFetch<TaskSwapRequestListItem[]>("/swap-requests/outgoing", { cookie });
}

// Dipanggil langsung dari server action bell notifikasi — ambil cookie sendiri
// dan diamkan kegagalan jadi list kosong, sama seperti getMyInvitations().
export async function getIncomingSwapRequests(): Promise<TaskSwapRequestListItem[]> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const { data } = await getIncomingSwapRequestsRequest(cookieHeader);
    return data;
  } catch {
    return [];
  }
}