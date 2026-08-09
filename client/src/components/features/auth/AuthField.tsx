import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

type AuthFieldProps = {
    id: string;
    name: string;
    label: string;
    type: "text" | "email" | "password";
    icon: LucideIcon;
    placeholder?: string;
    autoComplete?: string;
    error?: string;
    defaultValue?: string;
};

export default function AuthField({
    id,
    name,
    label,
    type,
    icon: Icon,
    placeholder,
    autoComplete,
    error,
    defaultValue,
}: AuthFieldProps) {
    const errorId = error ? `${id}-error` : undefined;

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-inter font-medium text-foreground">
                {label}
            </label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                    id={id}
                    name={name}
                    type={type}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    defaultValue={defaultValue}
                    aria-invalid={Boolean(error)}
                    aria-describedby={errorId}
                    className={cn(
                        "w-full min-h-11 rounded-lg border bg-background pl-9 pr-3 text-sm font-inter text-foreground outline-none transition-colors focus:border-primary",
                        error ? "border-status-blocked-text" : "border-border"
                    )}
                />
            </div>
            {error && (
                <p id={errorId} className="text-xs font-inter text-status-blocked-text">
                    {error}
                </p>
            )}
        </div>
    );
}