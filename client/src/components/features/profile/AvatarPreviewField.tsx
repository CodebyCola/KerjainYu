"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { getInitials } from "@/utils/getInitials";
import { cn } from "@/utils/cn";

type AvatarPreviewFieldProps = {
    id: string;
    name: string;
    label: string;
    placeholder?: string;
    defaultValue?: string;
    fallbackLabel: string;
    error?: string;
};

export default function AvatarPreviewField({
    id,
    name,
    label,
    placeholder,
    defaultValue,
    fallbackLabel,
    error,
}: AvatarPreviewFieldProps) {
    const [value, setValue] = useState(defaultValue ?? "");
    const [previewFailed, setPreviewFailed] = useState(false);
    const trimmed = value.trim();
    const showImage = trimmed.length > 0 && !previewFailed;
    const errorId = error ? `${id}-error` : undefined;

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-inter font-medium text-foreground">
                {label}
            </label>

            <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary">
                    {showImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={trimmed}
                            alt=""
                            className="size-full object-cover"
                            onError={() => setPreviewFailed(true)}
                            onLoad={() => setPreviewFailed(false)}
                        />
                    ) : (
                        <span className="text-xs font-inter font-semibold text-muted">
                            {getInitials(fallbackLabel)}
                        </span>
                    )}
                </div>

                <div className="relative min-w-0 flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                    <input
                        id={id}
                        name={name}
                        type="text"
                        inputMode="url"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            setPreviewFailed(false);
                        }}
                        aria-invalid={Boolean(error)}
                        aria-describedby={errorId}
                        className={cn(
                            "min-h-11 w-full rounded-lg border bg-background pl-9 pr-3 text-sm font-inter text-foreground outline-none transition-colors focus:border-primary",
                            error ? "border-status-blocked-text" : "border-border"
                        )}
                    />
                </div>
            </div>

            {error ? (
                <p id={errorId} className="text-xs font-inter text-status-blocked-text">
                    {error}
                </p>
            ) : (
                <p className="text-xs font-inter text-muted">
                    Tempel tautan gambar (JPG, PNG, dsb). Kosongkan untuk memakai inisial nama.
                </p>
            )}
        </div>
    );
}
