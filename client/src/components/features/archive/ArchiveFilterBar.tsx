"use client";

import {
    ArchiveFilters,
    ARCHIVE_STATUS_FILTER_OPTIONS,
    DEFAULT_ARCHIVE_FILTERS,
    countActiveArchiveFilters,
} from "@/app/(main)/archive/filters";
import FilterDropdown from "@/components/ui/FilterDropdown";

type ArchiveFilterBarProps = {
    filters: ArchiveFilters;
    onChange: (filters: ArchiveFilters) => void;
};

export default function ArchiveFilterBar({ filters, onChange }: ArchiveFilterBarProps) {
    const activeCount = countActiveArchiveFilters(filters);

    function updateStatus(status: ArchiveFilters["status"]) {
        onChange({ ...filters, status });
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown
                label="Status"
                options={ARCHIVE_STATUS_FILTER_OPTIONS}
                value={filters.status}
                onChange={updateStatus}
            />

            {activeCount > 0 && (
                <button
                    type="button"
                    onClick={() => onChange(DEFAULT_ARCHIVE_FILTERS)}
                    className="text-sm font-inter font-medium text-muted underline-offset-2 hover:text-foreground hover:underline"
                >
                    Reset filter
                </button>
            )}
        </div>
    );
}
