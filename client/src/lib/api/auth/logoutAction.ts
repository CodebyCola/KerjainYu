"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect(ROUTES.LOGIN);
}
