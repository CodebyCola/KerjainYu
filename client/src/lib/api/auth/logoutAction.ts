"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { logoutRequest } from "./auth";

export async function logoutAction() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    await logoutRequest(cookieHeader);
  } catch {
    // Tetap lanjut hapus cookie lokal walau server gagal dihubungi,
    // supaya user tidak terjebak dalam sesi yang terasa "login" di browser.
  }

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  redirect(ROUTES.LOGIN);
}
