"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { BoardColumnId } from "@/lib/api/tasks/taskStatus";

type FilterOption = {
    value: BoardColumnId;
    label: string;
};

type TaskBoardStatusFilterProps = {
    options: FilterOption[];
    value: BoardColumnId;
    onChange: (value: BoardColumnId) => void;
};

export default function TaskBoardStatusFilter({ options, value, onChange }: TaskBoardStatusFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selected = options.find((option) => option.value === value);

    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setIsOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className="flex min-h-9 items-center gap-1.5 rounded-full border border-primary bg-primary px-3.5 text-sm font-inter font-medium text-primary-foreground transition-colors"
            >
                Status:
                <span className="opacity-80">{selected?.label}</span>
                <ChevronDown className={cn("size-3.5 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div
                    role="listbox"
                    className="absolute left-0 top-[calc(100%+0.5rem)] z-10 min-w-44 rounded-lg border border-border bg-card p-1.5 shadow-lg"
                >
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-inter transition-colors",
                                    isSelected
                                        ? "bg-primary text-primary-foreground font-medium"
                                        : "text-foreground hover:bg-status-todo-bg"
                                )}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
