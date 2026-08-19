"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import AuthErrorBanner from "@/components/features/auth/AuthErrorBanner";
import { ActionDefinition } from "@/lib/api/tasks/taskStatus";
import { transitionTaskAction, TransitionTaskState } from "@/app/(main)/projects/[projectId]/task-board/actions";
import { cn } from "@/utils/cn";

// Aksi yang butuh modal catatan sebelum dieksekusi (lihat
// ACTIONS_REQUIRING_DETAIL di TaskBoardCard — sinkron dengan daftar itu).
type NoteAction = "submit" | "resume" | "requestRevision" | "reject";

type NoteModalCopy = {
    title: string;
    noteLabel: string;
    noteRequired: boolean;
    placeholder: string;
    submitLabel: string;
};

const MODAL_COPY: Record<NoteAction, NoteModalCopy> = {
    submit: {
        title: "Submit hasil kerja",
        noteLabel: "Catatan untuk leader",
        noteRequired: false,
        placeholder: "Ceritakan apa yang sudah dikerjakan (opsional)",
        submitLabel: "Submit",
    },
    resume: {
        title: "Submit ulang hasil kerja",
        noteLabel: "Catatan untuk leader",
        noteRequired: false,
        placeholder: "Ceritakan revisi yang sudah dikerjakan (opsional)",
        submitLabel: "Submit ulang",
    },
    requestRevision: {
        title: "Minta revisi",
        noteLabel: "Catatan revisi",
        noteRequired: true,
        placeholder: "Jelaskan apa yang perlu diperbaiki",
        submitLabel: "Kirim permintaan revisi",
    },
    reject: {
        title: "Tolak tugas",
        noteLabel: "Alasan penolakan",
        noteRequired: true,
        placeholder: "Jelaskan alasan tugas ini ditolak",
        submitLabel: "Tolak tugas",
    },
};

function isNoteAction(action: ActionDefinition["action"]): action is NoteAction {
    return action in MODAL_COPY;
}

const INITIAL_STATE: TransitionTaskState = { success: false, error: null };

const SUBMIT_BUTTON_STYLE: Record<ActionDefinition["variant"], string> = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    default: "bg-primary text-primary-foreground hover:opacity-90",
    danger: "bg-status-blocked-text text-white hover:opacity-90",
};

function SubmitButton({ label, variant }: { label: string; variant: ActionDefinition["variant"] }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className={cn(
                "flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-inter font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-60",
                SUBMIT_BUTTON_STYLE[variant]
            )}
        >
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {pending ? "Memproses..." : label}
        </button>
    );
}

type TaskActionModalProps = {
    definition: ActionDefinition | null;
    projectId: string;
    taskId: number;
    onClose: () => void;
};

export default function TaskActionModal({ definition, projectId, taskId, onClose }: TaskActionModalProps) {
    const noteAction = definition && isNoteAction(definition.action) ? definition.action : null;

    async function handleSubmit(_prevState: TransitionTaskState, formData: FormData) {
        if (!definition) return INITIAL_STATE;
        const note = String(formData.get("note") ?? "").trim();
        return transitionTaskAction(projectId, taskId, definition.action, {
            note: note || undefined,
            reviewNote: note || undefined,
        });
    }

    const [state, formAction] = useActionState(handleSubmit, INITIAL_STATE);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
            onClose();
        }
    }, [state, onClose]);

    if (!definition || !noteAction) return null;
    const copy = MODAL_COPY[noteAction];

    return (
        <Modal isOpen onClose={onClose} title={copy.title}>
            <form ref={formRef} action={formAction} className="flex flex-col gap-4" noValidate>
                <AuthErrorBanner message={state.error} />

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="note" className="text-sm font-inter font-medium text-foreground">
                        {copy.noteLabel}
                        {copy.noteRequired && <span className="text-status-blocked-text"> *</span>}
                    </label>
                    <textarea
                        id="note"
                        name="note"
                        rows={4}
                        required={copy.noteRequired}
                        placeholder={copy.placeholder}
                        maxLength={1000}
                        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-inter text-foreground outline-none transition-colors focus:border-primary"
                    />
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-inter font-medium text-foreground transition-colors hover:bg-status-todo-bg sm:min-h-10"
                    >
                        Batal
                    </button>
                    <SubmitButton label={copy.submitLabel} variant={definition.variant} />
                </div>
            </form>
        </Modal>
    );
}
