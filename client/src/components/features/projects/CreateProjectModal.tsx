"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { FolderPlus, Loader2 } from "lucide-react";
import { createProjectAction } from "@/app/(main)/projects/actions";
import { INITIAL_PROJECT_FORM_STATE } from "@/lib/api/projects/projectFormState";
import AuthField from "@/components/features/auth/AuthField";
import AuthErrorBanner from "@/components/features/auth/AuthErrorBanner";
import Modal from "@/components/ui/Modal";

type CreateProjectModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="mt-1 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {pending ? "Membuat..." : "Buat proyek"}
        </button>
    );
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
    const [state, formAction] = useActionState(createProjectAction, INITIAL_PROJECT_FORM_STATE);

    useEffect(() => {
        if (state.success && isOpen) {
            onClose();
        }
    }, [state, isOpen, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Buat proyek baru">
            <form action={formAction} className="flex flex-col gap-4" noValidate>
                <AuthErrorBanner message={state.error} />

                <AuthField
                    id="title"
                    name="title"
                    label="Judul proyek"
                    type="text"
                    icon={FolderPlus}
                    placeholder="Website Redesign"
                    autoComplete="off"
                    error={state.fieldErrors?.title}
                />

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="deadline" className="text-sm font-inter font-medium text-foreground">
                        Deadline
                    </label>
                    <input
                        id="deadline"
                        name="deadline"
                        type="date"
                        className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm font-inter text-foreground outline-none transition-colors focus:border-primary"
                    />
                </div>

                <label htmlFor="allowFreeSwap" className="flex items-center gap-2.5">
                    <input
                        id="allowFreeSwap"
                        name="allowFreeSwap"
                        type="checkbox"
                        className="size-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm font-inter text-foreground">
                        Izinkan anggota bertukar tugas bebas
                    </span>
                </label>

                <SubmitButton />
            </form>
        </Modal>
    );
}