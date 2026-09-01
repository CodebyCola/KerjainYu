"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
    updateProfileRequest,
    changePasswordRequest,
    type UpdateProfilePayload,
} from "@/lib/api/auth/auth";
import { ApiRequestError } from "@/lib/api/apiRequestError";
import { validateProfileFields, validateChangePasswordFields } from "@/lib/validation/authSchema";
import {
    ProfileFormState,
    ProfileFormValues,
    ChangePasswordFormState,
} from "@/lib/api/auth/profileFormState";
import { ROUTES } from "@/lib/routes";

export async function updateProfileAction(
    _prevState: ProfileFormState,
    formData: FormData,
): Promise<ProfileFormState> {
    const username = String(formData.get("username") ?? "");
    const email = String(formData.get("email") ?? "");
    const fullName = String(formData.get("fullName") ?? "");
    const avatarUrl = String(formData.get("avatarUrl") ?? "");
    const values: ProfileFormValues = { username, email, fullName, avatarUrl };

    const fieldErrors = validateProfileFields(username, email, fullName, avatarUrl);
    if (Object.keys(fieldErrors).length > 0) {
        return { success: false, error: null, fieldErrors, values };
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const payload: UpdateProfilePayload = {
        username: username.trim(),
        email: email.trim() || undefined,
        fullName: fullName.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
    };

    try {
        await updateProfileRequest(payload, cookieHeader);
    } catch (err) {
        if (err instanceof ApiRequestError) {
            // Server mengirim error unik per field lewat pesan generik (mis. "Username already taken"),
            // jadi dipetakan ke field yang relevan supaya feedback muncul tepat di input-nya.
            if (err.code === "CONFLICT") {
                const lower = err.message.toLowerCase();
                if (lower.includes("username")) {
                    return { success: false, error: null, fieldErrors: { username: err.message }, values };
                }
                if (lower.includes("email")) {
                    return { success: false, error: null, fieldErrors: { email: err.message }, values };
                }
            }
            return { success: false, error: err.message, values };
        }
        return { success: false, error: "Terjadi kesalahan tak terduga. Coba lagi.", values };
    }

    revalidatePath(ROUTES.PROFILE);
    return { success: true, error: null, values };
}

export async function changePasswordAction(
    _prevState: ChangePasswordFormState,
    formData: FormData,
): Promise<ChangePasswordFormState> {
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    const fieldErrors = validateChangePasswordFields(currentPassword, newPassword, confirmPassword);
    if (Object.keys(fieldErrors).length > 0) {
        return { success: false, error: null, fieldErrors };
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    try {
        await changePasswordRequest({ currentPassword, newPassword, confirmPassword }, cookieHeader);
    } catch (err) {
        if (err instanceof ApiRequestError) {
            if (err.code === "UNAUTHORIZED") {
                return {
                    success: false,
                    error: null,
                    fieldErrors: { currentPassword: "Password lama tidak sesuai" },
                };
            }
            return { success: false, error: err.message };
        }
        return { success: false, error: "Terjadi kesalahan tak terduga. Coba lagi." };
    }

    return { success: true, error: null };
}
