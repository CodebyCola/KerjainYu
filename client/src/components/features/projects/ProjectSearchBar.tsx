"use client";

import { Search } from "lucide-react";

type ProjectSearchBarProps = {
    value: string;
    onChange: (value: string) => void;
};

export default function ProjectSearchBar({ value, onChange }: ProjectSearchBarProps) {
    return (
        <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Cari proyek..."
                aria-label="Cari proyek"
                className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm font-inter text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            />
        </div>
    );
}