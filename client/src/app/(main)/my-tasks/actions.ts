"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ApiRequestError } from "@/lib/api/apiRequestError";
import { getOutgoingSwapRequestsRequest, cancelSwapRequestRequest } from "@/lib/api/tasks/swapRequests";
import { TaskSwapRequestListItem } from "@/types/task";
import { ROUTES } from "@/lib/routes";

export async function getMyOutgoingSwapRequestsAction(): Promise<TaskSwapRequestListItem[]> {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();

        const { data } = await getOutgoingSwapRequestsRequest(cookieHeader);
        return data;
    } catch {
        return [];
    }
}

export type CancelSwapRequestState = {
    success: boolean;
    error: string | null;
};

// PATCH /swap-requests/:id/cancel — hanya berlaku untuk request berstatus
// "pending" milik sendiri; server yang menegakkan aturan itu (403/409 kalau
// dilanggar), di sini cukup teruskan pesan errornya.
export async function cancelSwapRequestAction(swapRequestId: number): Promise<CancelSwapRequestState> {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();

        await cancelSwapRequestRequest(swapRequestId, cookieHeader);
    } catch (err) {
        if (err instanceof ApiRequestError) {
            return { success: false, error: err.message };
        }
        return { success: false, error: "Terjadi kesalahan tak terduga. Coba lagi." };
    }

    revalidatePath(ROUTES.MY_TASK);
    return { success: true, error: null };
}
