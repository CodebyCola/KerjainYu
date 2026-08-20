"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { ProjectLink, ProjectLinkCategory } from "@/types/project";
import { CATEGORY_OPTIONS } from "@/utils/projectLink";
import { cn } from "@/utils/cn";
import { addLinkAction } from "@/app/(main)/projects/[projectId]/files/actions";

type AddLinkModalProps = {
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
    onAdded: (link: ProjectLink) => void;
};

const DEFAULT_CATEGORY: ProjectLinkCategory = "other";

export default function AddLinkModal({ projectId, isOpen, onClose, onAdded }: AddLinkModalProps) {
    const [label, setLabel] = useState("");
    const [url, setUrl] = useState("");
    const [category, setCategory] = useState<ProjectLinkCategory>(DEFAULT_CATEGORY);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function reset() {
        setLabel("");
        setUrl("");
        setCategory(DEFAULT_CATEGORY);
        setError(null);
    }

    function handleClose() {
        if (isPending) return;
        reset();
        onClose();
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const trimmedLabel = label.trim();
        const trimmedUrl = url.trim();

        if (!trimmedLabel) {
            setError("Nama berkas wajib diisi.");
            return;
        }
        if (!trimmedUrl) {
            setError("Tautan wajib diisi.");
            return;
        }

        setError(null);
        startTransition(async () => {
            const result = await addLinkAction(projectId, {
                label: trimmedLabel,
                url: trimmedUrl,
                category,
            });

            if (!result.link) {
                setError(result.error ?? "Gagal menambahkan berkas.");
                return;
            }

            onAdded(result.link);
            reset();
            onClose();
        });
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Tambah Berkas">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="link-label" className="text-sm font-inter font-medium text-foreground">
                        Nama berkas
                    </label>
                    <input
                        id="link-label"
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Contoh: Desain UI Figma"
                        autoFocus
                        maxLength={100}
                        className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-inter text-foreground outline-none transition-colors focus:border-primary"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="link-url" className="text-sm font-inter font-medium text-foreground">
                        Tautan
                    </label>
                    <input
                        id="link-url"
                        type="text"
                        inputMode="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://figma.com/..."
                        className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-inter text-foreground outline-none transition-colors focus:border-primary"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-inter font-medium text-foreground">Kategori</span>
                    <div className="flex flex-wrap gap-1.5">
                        {CATEGORY_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setCategory(option.value)}
                                aria-pressed={category === option.value}
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-xs font-inter font-medium transition-colors",
                                    category === option.value
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border text-muted hover:bg-status-todo-bg hover:text-foreground"
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <p className="text-sm font-inter text-status-blocked-text">{error}</p>}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isPending}
                        className="flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-inter font-medium text-foreground transition-colors hover:bg-status-todo-bg disabled:opacity-60 sm:min-h-10"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        aria-busy={isPending}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10"
                    >
                        {isPending ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        ) : (
                            <Plus className="size-4" aria-hidden="true" />
                        )}
                        {isPending ? "Menambahkan..." : "Tambah"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}