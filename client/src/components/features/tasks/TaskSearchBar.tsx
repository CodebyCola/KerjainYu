"use client";

import { Search } from "lucide-react";

type TaskSearchBarProps = {
    value: string;
    onChange: (value: string) => void;
};

export default function TaskSearchBar({ value, onChange }: TaskSearchBarProps) {
    return (
        <div className="flex flex-col gap-2">
            <span className="hidden text-sm font-inter font-medium text-foreground lg:block" aria-hidden="true">
            </span>
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                    id="task-search"
                    type="text"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="Cari tugas..."
                    aria-label="Cari tugas"
                    className="min-h-9 w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm font-inter text-foreground placeholder:text-muted focus:border-primary focus:outline-none lg:rounded-full lg:py-0"
                />
            </div>
        </div>
    );
}
