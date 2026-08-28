import { useState, useTransition } from "react";
import {
    createAttachmentUploadUrlAction,
    createAttachmentAction,
} from "@/app/(main)/projects/[projectId]/task-board/actions";

export type PendingContent = { kind: "text" | "link"; value: string };

type UploadAttachmentsArgs = {
    projectId: string;
    taskId: number;
    submissionId: number;
    contents: PendingContent[];
    files: File[];
};


export function useAttachmentUpload() {
    const [error, setError] = useState<string | null>(null);
    const [statusText, setStatusText] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    async function uploadAll({ projectId, taskId, submissionId, contents, files }: UploadAttachmentsArgs) {
        for (const content of contents) {
            setStatusText(`Menyimpan ${content.kind === "link" ? "tautan" : "catatan"}...`);
            const attachRes = await createAttachmentAction(projectId, taskId, submissionId, {
                content: { type: content.kind, content: content.value },
                file: null,
            });
            if (!attachRes.success) {
                return attachRes.error ?? "Ada lampiran yang gagal disimpan.";
            }
        }

        for (const file of files) {
            setStatusText(`Mengupload ${file.name}...`);
            const isImage = file.type.startsWith("image/");
            const urlRes = await createAttachmentUploadUrlAction(submissionId, {
                type: isImage ? "image" : "file",
                fileName: file.name,
                mimeType: file.type || "application/octet-stream",
                fileSize: file.size,
            });

            if (!urlRes.success || !urlRes.uploadUrl || !urlRes.objectKey) {
                return urlRes.error ?? `Gagal mengupload "${file.name}".`;
            }

            try {
                const putRes = await fetch(urlRes.uploadUrl, {
                    method: "PUT",
                    headers: { "Content-Type": file.type || "application/octet-stream" },
                    body: file,
                });
                if (!putRes.ok) throw new Error("upload failed");
            } catch {
                return `Upload "${file.name}" gagal. Coba lampirkan ulang.`;
            }

            const attachRes = await createAttachmentAction(projectId, taskId, submissionId, {
                content: null,
                file: {
                    type: isImage ? "image" : "file",
                    objectKey: urlRes.objectKey,
                    fileName: file.name,
                    mimeType: file.type || "application/octet-stream",
                    fileSize: file.size,
                },
            });
            if (!attachRes.success) {
                return attachRes.error ?? `Metadata file "${file.name}" gagal disimpan.`;
            }
        }

        return null;
    }

    function reset() {
        setError(null);
        setStatusText(null);
    }

    return { uploadAll, isPending, startTransition, error, setError, statusText, setStatusText, reset };
}
