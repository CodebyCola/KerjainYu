import { CheckCircle2 } from "lucide-react";

type AuthSuccessBannerProps = {
    message: string | null;
};

export default function AuthSuccessBanner({ message }: AuthSuccessBannerProps) {
    if (!message) return null;

    return (
        <div
            role="status"
            className="flex items-start gap-2 rounded-lg bg-status-done-bg px-3 py-2.5 text-sm font-inter text-status-done-text"
        >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>{message}</span>
        </div>
    );
}