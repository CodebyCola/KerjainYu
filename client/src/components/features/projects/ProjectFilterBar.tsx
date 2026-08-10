"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
    ProjectFilters,
    STATUS_FILTER_OPTIONS,
    DEADLINE_FILTER_OPTIONS,
    DEFAULT_PROJECT_FILTERS,
    countActiveFilters,
} from "@/app/(main)/projects/filters";
import ProjectFilterGroup from "@/components/features/projects/ProjectFilterGroup";
import Modal from "@/components/ui/Modal";
import { cn } from "@/utils/cn";

type ProjectFilterBarProps = {
    filters: ProjectFilters;
    onChange: (filters: ProjectFilters) => void;
};

export default function ProjectFilterBar({ filters, onChange }: ProjectFilterBarProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const activeCount = countActiveFilters(filters);

    function updateStatus(status: ProjectFilters["status"]) {
        onChange({ ...filters, status });
    }

    function updateDeadline(deadline: ProjectFilters["deadline"]) {
        onChange({ ...filters, deadline });
    }

    function reset() {
        onChange(DEFAULT_PROJECT_FILTERS);
    }

    return (
        <>
            {/* Mobile: tombol yang membuka panel filter */}
            <div className="md:hidden">
                <button
                    type="button"
                    onClick={() => setIsMobileOpen(true)}
                    aria-label={`Buka filter proyek${activeCount > 0 ? `, ${activeCount} filter aktif` : ""}`}
                    className={cn(
                        "relative flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-inter font-medium transition-colors",
                        activeCount > 0
                            ? "border-primary text-primary"
                            : "border-border text-foreground hover:border-primary"
                    )}
                >
                    <SlidersHorizontal className="size-4" />
                    Filter
                    {activeCount > 0 && (
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-inter font-semibold text-primary-foreground">
                            {activeCount}
                        </span>
                    )}
                </button>

                <Modal isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} title="Filter proyek">
                    <div className="flex flex-col gap-5">
                        <ProjectFilterGroup
                            legend="Status"
                            name="mobile-status-filter"
                            options={STATUS_FILTER_OPTIONS}
                            value={filters.status}
                            onChange={updateStatus}
                        />
                        <ProjectFilterGroup
                            legend="Deadline"
                            name="mobile-deadline-filter"
                            options={DEADLINE_FILTER_OPTIONS}
                            value={filters.deadline}
                            onChange={updateDeadline}
                        />

                        <div className="flex gap-2 border-t border-border pt-4">
                            <button
                                type="button"
                                onClick={reset}
                                disabled={activeCount === 0}
                                className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-border text-sm font-inter font-medium text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsMobileOpen(false)}
                                className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-primary text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90"
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>

            {/* Tablet & desktop: filter pills tampil langsung sejajar */}
            <div className="hidden md:flex md:flex-wrap md:items-start md:gap-4">
                <ProjectFilterGroup
                    legend="Status"
                    name="desktop-status-filter"
                    options={STATUS_FILTER_OPTIONS}
                    value={filters.status}
                    onChange={updateStatus}
                />
                <ProjectFilterGroup
                    legend="Deadline"
                    name="desktop-deadline-filter"
                    options={DEADLINE_FILTER_OPTIONS}
                    value={filters.deadline}
                    onChange={updateDeadline}
                />

                {activeCount > 0 && (
                    <button
                        type="button"
                        onClick={reset}
                        className="pt-6.5 text-sm font-inter font-medium text-muted underline-offset-2 hover:text-foreground hover:underline"
                    >
                        Reset filter
                    </button>
                )}
            </div>
        </>
    );
}