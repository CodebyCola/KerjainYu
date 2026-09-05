"use server";

import { getUnreadNotificationCount } from "@/lib/api/notifications/notifications";

export async function getUnreadNotificationCountAction(): Promise<number> {
  return getUnreadNotificationCount();
}
