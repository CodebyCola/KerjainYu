"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { loginRequest } from "@/lib/api/auth/auth";
import { ApiRequestError } from "@/lib/api/apiRequestError";
import { validateLoginFields } from "@/lib/validation/authSchema";
import { AuthFormState } from "@/lib/api/auth/authFormState";

export async function loginAction(
    _prevState: AuthFormState,
    formData: FormData
): Promise<AuthFormState> {
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");

    const fieldErrors = validateLoginFields(username, password);
    if (Object.keys(fieldErrors).length > 0) {
        return { error: null, fieldErrors };
    }

    try {
        const { setCookie } = await loginRequest({ username: username.trim(), password });

        if (setCookie) {
            await forwardSetCookie(setCookie);
        }
    } catch (err) {
        if (err instanceof ApiRequestError) {
            return { error: err.message };
        }
        return { error: "Terjadi kesalahan tak terduga. Coba lagi." };
    }

    redirect(ROUTES.PROJECTS);
}


async function forwardSetCookie(rawSetCookie: string) {
    const cookieStore = await cookies();
    const [nameValue, ...attributePairs] = rawSetCookie.split(";").map((part) => part.trim());
    const [name, ...valueParts] = nameValue.split("=");
    const value = valueParts.join("=");

    const attributes: Record<string, string | boolean> = {};
    for (const attr of attributePairs) {
        const [key, val] = attr.split("=");
        attributes[key.toLowerCase()] = val ?? true;
    }

    cookieStore.set(name, decodeURIComponent(value), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: typeof attributes.path === "string" ? attributes.path : "/",
        maxAge: attributes["max-age"] ? Number(attributes["max-age"]) : undefined,
    });
}