"use client";

import { useActionState } from "react";
import { User, Lock } from "lucide-react";
import { loginAction } from "./actions";
import { INITIAL_AUTH_FORM_STATE } from "@/lib/api/auth/authFormState";
import AuthField from "@/components/features/auth/AuthField";
import AuthErrorBanner from "@/components/features/auth/AuthErrorBanner";
import AuthSubmitButton from "@/components/features/auth/AuthSubmitButton";

export default function LoginForm() {
    const [state, formAction] = useActionState(loginAction, INITIAL_AUTH_FORM_STATE);

    return (
        <form action={formAction} className="flex flex-col" style={{ gap: "clamp(0.5rem, 2vh, 1rem)" }} noValidate>
            <AuthErrorBanner message={state.error} />

            <AuthField
                id="username"
                name="username"
                label="Username"
                type="text"
                icon={User}
                placeholder="username_kamu"
                autoComplete="username"
                error={state.fieldErrors?.username}
            />

            <AuthField
                id="password"
                name="password"
                label="Password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                autoComplete="current-password"
                error={state.fieldErrors?.password}
            />

            <AuthSubmitButton idleLabel="Login" pendingLabel="Memproses..." />
        </form>
    );
}