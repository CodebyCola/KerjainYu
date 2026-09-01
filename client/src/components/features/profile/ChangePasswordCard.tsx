"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { KeyRound, Loader2, Check } from "lucide-react";
import { changePasswordAction } from "@/app/(main)/profile/actions";
import { INITIAL_CHANGE_PASSWORD_FORM_STATE } from "@/lib/api/auth/profileFormState";
import PasswordField from "@/components/features/profile/PasswordField";
import AuthErrorBanner from "@/components/features/auth/AuthErrorBanner";
import SettingsSection from "@/components/features/settings/SettingsSection";

function SaveButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-5"
        >
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {pending ? "Menyimpan..." : "Ubah password"}
        </button>
    );
}

export default function ChangePasswordCard() {
    const [state, formAction] = useActionState(changePasswordAction, INITIAL_CHANGE_PASSWORD_FORM_STATE);
    const formRef = useRef<HTMLFormElement>(null);

    // Kosongkan form setelah password berhasil diubah — field password
    // tidak pakai defaultValue/controlled state, jadi reset manual di sini.
    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
        }
    }, [state.success]);

    return (
        <SettingsSection
            icon={KeyRound}
            title="Keamanan Akun"
            description="Perbarui password secara berkala untuk menjaga keamanan akunmu."
        >
            <form ref={formRef} action={formAction} className="flex flex-col gap-4" noValidate>
                <AuthErrorBanner message={state.error} />

                <PasswordField
                    id="currentPassword"
                    name="currentPassword"
                    label="Password saat ini"
                    placeholder="Masukkan password lama"
                    autoComplete="current-password"
                    error={state.fieldErrors?.currentPassword}
                />

                <PasswordField
                    id="newPassword"
                    name="newPassword"
                    label="Password baru"
                    placeholder="Min. 8 karakter, 1 huruf besar, 1 angka"
                    autoComplete="new-password"
                    error={state.fieldErrors?.newPassword}
                />

                <PasswordField
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Konfirmasi password baru"
                    placeholder="Ulangi password baru"
                    autoComplete="new-password"
                    error={state.fieldErrors?.confirmPassword}
                />

                <div className="flex items-center gap-3">
                    <SaveButton />
                    {state.success && (
                        <span className="flex items-center gap-1 text-xs font-inter text-status-done-text">
                            <Check className="size-3.5" />
                            Password diperbarui
                        </span>
                    )}
                </div>
            </form>
        </SettingsSection>
    );
}
