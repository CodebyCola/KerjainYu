"use server";

import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { registerRequest } from "@/lib/api/auth/auth";
import { ApiRequestError } from "@/lib/api/apiRequestError";
import { validateRegisterFields } from "@/lib/validation/authSchema";
import { AuthFormState } from "@/lib/api/auth/authFormState";

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors = validateRegisterFields(
    username,
    password,
    confirmPassword,
  );
  if (Object.keys(fieldErrors).length > 0) {
    return { error: null, fieldErrors };
  }

  try {
    await registerRequest({ username: username.trim(), password });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      if (err.code === "CONFLICT") {
        return { error: null, fieldErrors: { username: err.message } };
      }
      return { error: err.message };
    }
    return { error: "Terjadi kesalahan tak terduga. Coba lagi." };
  }

  redirect(`${ROUTES.LOGIN}?registered=1`);
}
