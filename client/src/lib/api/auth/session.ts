import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { User } from "@/types/user";
import { getMeRequest } from "./auth";

export const getSession = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const { data } = await getMeRequest(`token=${token}`);
    return data;
  } catch {
    return null;
  }
});
