import { cn } from "@/utils/cn";

type TaskDescriptionFieldProps = {
    id: string;
    name: string;
    label: string;
    placeholder?: string;
    error?: string;
    defaultValue?: string;
};

export default function TaskDescriptionField({
    id,
    name,
    label,
    placeholder,
    error,
    defaultValue,
}: TaskDescriptionFieldProps) {
    const errorId = error ? `${id}-error` : undefined;

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-inter font-medium text-foreground">
                {label}
            </label>
            <textarea
                id={id}
                name={name}
                rows={3}
                placeholder={placeholder}
                defaultValue={defaultValue}
                aria-invalid={Boolean(error)}
                aria-describedby={errorId}
                className={cn(
                    "w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm font-inter text-foreground outline-none transition-colors focus:border-primary",
                    error ? "border-status-blocked-text" : "border-border"
                )}
            />
            {error && (
                <p id={errorId} className="text-xs font-inter text-status-blocked-text">
                    {error}
                </p>
            )}
        </div>
    );
}
