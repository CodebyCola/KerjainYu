"use server";

import { cookies } from "next/headers";
import { ApiRequestError } from "@/lib/api/apiRequestError";
import {
  getUnreadNotificationCount,
  markAllNotificationsAsReadRequest,
} from "@/lib/api/notifications/notifications";

export async function getUnreadNotificationCountAction(): Promise<number> {
  return getUnreadNotificationCount();
}

export type MarkAllNotificationsAsReadState = {
  success: boolean;
  error: string | null;
};

// Dipanggil pas badge di-reset di client (buka NotificationModal), supaya
// status "read" beneran ke-persist di DB -- bukan cuma di state React yang
// hilang lagi begitu di-refresh.
export async function markAllNotificationsAsReadAction(): Promise<MarkAllNotificationsAsReadState> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    await markAllNotificationsAsReadRequest(cookieHeader);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: "Terjadi kesalahan tak terduga. Coba lagi.",
    };
  }

  return { success: true, error: null };
}
