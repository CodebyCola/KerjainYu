"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/utils/cn";

type PasswordFieldProps = {
    id: string;
    name: string;
    label: string;
    placeholder?: string;
    autoComplete?: string;
    error?: string;
    hint?: string;
};

export default function PasswordField({
    id,
    name,
    label,
    placeholder,
    autoComplete,
    error,
    hint,
}: PasswordFieldProps) {
    const [visible, setVisible] = useState(false);
    const errorId = error ? `${id}-error` : undefined;
    const hintId = hint && !error ? `${id}-hint` : undefined;

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-inter font-medium text-foreground">
                {label}
            </label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                    id={id}
                    name={name}
                    type={visible ? "text" : "password"}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    aria-invalid={Boolean(error)}
                    aria-describedby={errorId ?? hintId}
                    className={cn(
                        "w-full min-h-11 rounded-lg border bg-background pl-9 pr-10 text-sm font-inter text-foreground outline-none transition-colors focus:border-primary",
                        error ? "border-status-blocked-text" : "border-border"
                    )}
                />
                <button
                    type="button"
                    onClick={() => setVisible((prev) => !prev)}
                    aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
                    aria-pressed={visible}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition-colors hover:text-foreground"
                >
                    {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
            </div>
            {error ? (
                <p id={errorId} className="text-xs font-inter text-status-blocked-text">
                    {error}
                </p>
            ) : (
                hint && (
                    <p id={hintId} className="text-xs font-inter text-muted">
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}
