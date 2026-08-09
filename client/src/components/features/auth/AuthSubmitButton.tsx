"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

type AuthSubmitButtonProps = {
    idleLabel: string;
    pendingLabel: string;
};

export default function AuthSubmitButton({ idleLabel, pendingLabel }: AuthSubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="mt-1 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {pending ? pendingLabel : idleLabel}
        </button>
    );
}