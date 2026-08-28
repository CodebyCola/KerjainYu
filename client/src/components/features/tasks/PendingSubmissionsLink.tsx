import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { projectRoutes } from "@/lib/routes";

type PendingSubmissionsLinkProps = {
    projectId: string;
    count: number;
};

export default function PendingSubmissionsLink({ projectId, count }: PendingSubmissionsLinkProps) {
    return (
        <Link
            href={projectRoutes(projectId).PENDING_SUBMISSIONS}
            className="relative flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-sm font-inter font-medium text-foreground transition-colors hover:border-primary"
        >
            <ClipboardCheck className="size-4" />
            <span className="hidden sm:inline">Submission Menunggu Review</span>
            <span className="sm:hidden">Review</span>
            {count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-status-blocked-text px-1 text-[11px] font-semibold text-white">
                    {count}
                </span>
            )}
        </Link>
    );
}
