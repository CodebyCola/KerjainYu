"use server";

import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { loginRequest } from "@/lib/api/auth/auth";
import { forwardSetCookies } from "@/lib/api/auth/forwardCookies";
import { ApiRequestError } from "@/lib/api/apiRequestError";
import { validateLoginFields } from "@/lib/validation/authSchema";
import { AuthFormState } from "@/lib/api/auth/authFormState";

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const fieldErrors = validateLoginFields(username, password);
  if (Object.keys(fieldErrors).length > 0) {
    return { error: null, fieldErrors };
  }

  try {
    const { setCookies } = await loginRequest({
      username: username.trim(),
      password,
    });
    await forwardSetCookies(setCookies);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { error: err.message };
    }
    return { error: "Terjadi kesalahan tak terduga. Coba lagi." };
  }

  redirect(ROUTES.PROJECTS);
}
