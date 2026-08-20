import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { User } from "@/types/user";
import { getMeRequest } from "./auth";

export const getSession = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) return null;

  try {
    const { data } = await getMeRequest(cookieStore.toString());
    return data;
  } catch {
    return null;
  }
});