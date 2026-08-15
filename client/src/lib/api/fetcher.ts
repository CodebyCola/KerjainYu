import "server-only";
import { API_BASE_URL } from "@/lib/env";
import { ApiResponse } from "@/types/api";
import { ApiRequestError } from "./apiRequestError";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  cookie?: string;
};

type ApiResult<T> = {
  data: T;
  setCookies: string[];
};

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, cookie }: RequestOptions = {},
): Promise<ApiResult<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new ApiRequestError({
      code: "NETWORK_ERROR",
      message:
        "Tidak bisa terhubung ke server. Periksa koneksi kamu dan coba lagi.",
      httpStatus: 0,
    });
  }

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new ApiRequestError({
      code: "INVALID_RESPONSE",
      message: "Server mengembalikan respons yang tidak valid.",
      httpStatus: response.status,
    });
  }

  if (!json.success) {
    throw new ApiRequestError(json.error);
  }

  return {
    data: json.data,
    setCookies: response.headers.getSetCookie(),
  };
}
