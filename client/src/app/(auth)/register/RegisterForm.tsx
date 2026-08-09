"use client";

import { useActionState } from "react";
import { User, Lock } from "lucide-react";
import { registerAction } from "./actions";
import { INITIAL_AUTH_FORM_STATE } from "@/lib/api/auth/authFormState";
import AuthField from "@/components/features/auth/AuthField";
import AuthErrorBanner from "@/components/features/auth/AuthErrorBanner";
import AuthSubmitButton from "@/components/features/auth/AuthSubmitButton";

export default function RegisterForm() {
    const [state, formAction] = useActionState(registerAction, INITIAL_AUTH_FORM_STATE);

    return (
        <form action={formAction} className="flex flex-col" style={{ gap: "clamp(0.5rem, 2vh, 1rem)" }} noValidate>
            <AuthErrorBanner message={state.error} />

            <AuthField
                id="username"
                name="username"
                label="Username"
                type="text"
                icon={User}
                placeholder="Minimal 3 karakter"
                autoComplete="username"
                error={state.fieldErrors?.username}
            />

            <AuthField
                id="password"
                name="password"
                label="Password"
                type="password"
                icon={Lock}
                placeholder="Min. 8 karakter, 1 huruf besar, 1 angka"
                autoComplete="new-password"
                error={state.fieldErrors?.password}
            />

            <AuthField
                id="confirmPassword"
                name="confirmPassword"
                label="Konfirmasi password"
                type="password"
                icon={Lock}
                placeholder="Ulangi password kamu"
                autoComplete="new-password"
                error={state.fieldErrors?.confirmPassword}
            />

            <AuthSubmitButton idleLabel="Daftar" pendingLabel="Mendaftarkan..." />
        </form>
    );
}