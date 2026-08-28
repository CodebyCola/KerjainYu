"use client";

import { useState } from "react";
import { Link2, FileText, Paperclip, X } from "lucide-react";
import { PendingContent } from "@/lib/hooks/useAttachmentUpload";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

type AttachmentComposerProps = {
    contents: PendingContent[];
    files: File[];
    onContentsChange: (contents: PendingContent[]) => void;
    onFilesChange: (files: File[]) => void;
    onError: (message: string) => void;
};

// Input tautan + file picker + daftar preview lampiran yang belum
// diupload. Dipakai TaskActionModal (submit) dan AddAttachmentModal
// (tambah lampiran susulan) supaya form-nya konsisten di kedua tempat.
export default function AttachmentComposer({
    contents,
    files,
    onContentsChange,
    onFilesChange,
    onError,
}: AttachmentComposerProps) {
    const [linkDraft, setLinkDraft] = useState("");

    function handleFilesSelected(selected: FileList | null) {
        if (!selected) return;
        const next: File[] = [];
        for (const file of Array.from(selected)) {
            if (file.size > MAX_FILE_SIZE) {
                onError(`File "${file.name}" melebihi batas 10MB.`);
                continue;
            }
            next.push(file);
        }
        onFilesChange([...files, ...next]);
    }

    function addLink() {
        const value = linkDraft.trim();
        if (!value) return;
        onContentsChange([...contents, { kind: "link", value }]);
        setLinkDraft("");
    }

    function removeContent(index: number) {
        onContentsChange(contents.filter((_, i) => i !== index));
    }

    function removeFile(index: number) {
        onFilesChange(files.filter((_, i) => i !== index));
    }

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
                <input
                    type="url"
                    value={linkDraft}
                    onChange={(e) => setLinkDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addLink();
                        }
                    }}
                    placeholder="Tempel tautan (mis. Figma, Google Docs)"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-inter text-foreground outline-none transition-colors focus:border-primary"
                />
                <button
                    type="button"
                    onClick={addLink}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-3 text-sm font-inter font-medium text-foreground transition-colors hover:border-primary"
                >
                    <Link2 className="size-3.5" />
                    Tambah
                </button>
            </div>

            <label className="flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-sm font-inter text-muted transition-colors hover:border-primary hover:text-foreground">
                <Paperclip className="size-3.5" />
                Pilih file atau gambar (maks 10MB)
                <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                />
            </label>

            {(contents.length > 0 || files.length > 0) && (
                <ul className="flex flex-col gap-1.5">
                    {contents.map((content, index) => (
                        <li
                            key={`content-${index}`}
                            className="flex items-center gap-2 rounded-lg bg-status-todo-bg px-3 py-2 text-xs font-inter text-foreground"
                        >
                            {content.kind === "link" ? (
                                <Link2 className="size-3.5 shrink-0" />
                            ) : (
                                <FileText className="size-3.5 shrink-0" />
                            )}
                            <span className="min-w-0 flex-1 truncate">{content.value}</span>
                            <button
                                type="button"
                                onClick={() => removeContent(index)}
                                aria-label="Hapus lampiran"
                                className="shrink-0 text-muted hover:text-status-blocked-text"
                            >
                                <X className="size-3.5" />
                            </button>
                        </li>
                    ))}
                    {files.map((file, index) => (
                        <li
                            key={`file-${index}`}
                            className="flex items-center gap-2 rounded-lg bg-status-todo-bg px-3 py-2 text-xs font-inter text-foreground"
                        >
                            <Paperclip className="size-3.5 shrink-0" />
                            <span className="min-w-0 flex-1 truncate">{file.name}</span>
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                aria-label="Hapus lampiran"
                                className="shrink-0 text-muted hover:text-status-blocked-text"
                            >
                                <X className="size-3.5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
