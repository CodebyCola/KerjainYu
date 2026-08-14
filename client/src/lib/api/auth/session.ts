import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { User } from "@/types/user";
import { getMeRequest, refreshRequest } from "./auth";
import { ApiRequestError } from "../apiRequestError";
import { forwardSetCookies } from "./forwardCookies";

export const getSession = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!accessToken && !refreshToken) return null;

  if (accessToken) {
    try {
      const { data } = await getMeRequest(cookieStore.toString());
      return data;
    } catch (err) {
      if (!(err instanceof ApiRequestError) || err.httpStatus !== 401) {
        return null;
      }
    }
  }

  if (!refreshToken) return null;

  try {
    const { setCookies } = await refreshRequest(cookieStore.toString());
    await forwardSetCookies(setCookies);

    const refreshedCookieStore = await cookies();
    const { data } = await getMeRequest(refreshedCookieStore.toString());
    return data;
  } catch {
    return null;
  }
});
