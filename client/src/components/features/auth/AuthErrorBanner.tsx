import { AlertCircle } from "lucide-react";

type AuthErrorBannerProps = {
    message: string | null;
};

export default function AuthErrorBanner({ message }: AuthErrorBannerProps) {
    if (!message) return null;

    return (
        <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-status-blocked-bg px-3 py-2.5 text-sm font-inter text-status-blocked-text"
        >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{message}</span>
        </div>
    );
}