import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

type SettingsSectionProps = {
    title: string;
    description?: string;
    icon?: LucideIcon;
    tone?: "default" | "danger";
    children: React.ReactNode;
};

const TONE_ICON_STYLE: Record<NonNullable<SettingsSectionProps["tone"]>, string> = {
    default: "text-muted",
    danger: "text-status-blocked-text",
};

export default function SettingsSection({
    title,
    description,
    icon: Icon,
    tone = "default",
    children,
}: SettingsSectionProps) {
    return (
        <section
            className={cn(
                "rounded-xl border bg-card p-4 sm:p-5",
                tone === "danger" ? "border-status-blocked-text/40" : "border-border"
            )}
        >
            <div className="flex items-start gap-2.5">
                {Icon && <Icon className={cn("mt-0.5 size-4.5 shrink-0", TONE_ICON_STYLE[tone])} />}
                <div className="min-w-0">
                    <h3 className="font-inter text-sm font-semibold text-foreground sm:text-base">
                        {title}
                    </h3>
                    {description && (
                        <p className="mt-0.5 text-xs font-inter text-muted sm:text-sm">{description}</p>
                    )}
                </div>
            </div>

            <div className="mt-4">{children}</div>
        </section>
    );
}
