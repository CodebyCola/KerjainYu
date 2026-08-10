import Link from "next/link";
import { CalendarDays, Link2, Repeat } from "lucide-react";
import { Project } from "@/types/project";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/getInitials";

type ProjectListCardProps = {
    project: Project;
};

const STATUS_STYLE: Record<Project["status"], string> = {
    ongoing: "bg-status-progress-bg text-status-progress-text",
    completed: "bg-status-done-bg text-status-done-text",
};

const STATUS_LABEL: Record<Project["status"], string> = {
    ongoing: "Ongoing",
    completed: "Completed",
};

function formatDeadline(deadline: string) {
    return new Date(deadline).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function isOverdue(deadline: string, status: Project["status"]) {
    return status === "ongoing" && new Date(deadline).getTime() < Date.now();
}

export default function ProjectListCard({ project }: ProjectListCardProps) {
    const members = project.members ?? [];
    const links = project.links ?? [];
    const leader = members.find((member) => member.role === "leader");
    const overdue = isOverdue(project.deadline, project.status);

    return (
        <Link
            href={`/projects/${project.id}`}
            aria-label={`Buka proyek ${project.title}`}
            className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary sm:p-5"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <h3 className="font-inter text-base font-semibold text-foreground sm:text-lg">
                    {project.title}
                </h3>
                <span
                    className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-inter font-medium",
                        STATUS_STYLE[project.status]
                    )}
                >
                    {STATUS_LABEL[project.status]}
                </span>
            </div>

            {/* Meta */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-inter text-muted sm:text-sm">
                <span
                    className={cn(
                        "flex items-center gap-1.5",
                        overdue && "text-status-blocked-text font-medium"
                    )}
                >
                    <CalendarDays className="size-3.5 sm:size-4" />
                    {formatDeadline(project.deadline)}
                    {overdue && " · Lewat tenggat"}
                </span>

                {links.length > 0 && (
                    <span className="flex items-center gap-1.5">
                        <Link2 className="size-3.5 sm:size-4" />
                        {links.length} link
                    </span>
                )}

                {project.allowFreeSwap && (
                    <span className="flex items-center gap-1.5">
                        <Repeat className="size-3.5 sm:size-4" />
                        Free swap
                    </span>
                )}
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                    {members.slice(0, 4).map((member) => (
                        <div
                            key={member.id}
                            title={member.username}
                            className={cn(
                                "flex size-7 items-center justify-center rounded-full border-2 border-card text-[10px] font-inter font-semibold sm:size-8 sm:text-xs",
                                member.role === "leader"
                                    ? "bg-role-lead-bg text-role-lead-text"
                                    : "bg-role-member-bg text-role-member-text"
                            )}
                        >
                            {getInitials(member.username)}
                        </div>
                    ))}
                    {members.length > 4 && (
                        <div className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-secondary text-[10px] font-inter font-medium text-teritary sm:size-8 sm:text-xs">
                            +{members.length - 4}
                        </div>
                    )}
                </div>

                {leader && (
                    <span className="text-xs font-inter text-muted sm:text-sm">
                        Leader: <span className="text-foreground">{leader.username}</span>
                    </span>
                )}
            </div>
        </Link>
    );
}