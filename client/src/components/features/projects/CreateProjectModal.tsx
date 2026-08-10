"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { FolderPlus, CalendarDays, Loader2 } from "lucide-react";
import { createProjectAction } from "@/app/(main)/projects/actions";
import { INITIAL_PROJECT_FORM_STATE } from "@/lib/api/projects/projectFormState";
import ProjectFormField from "@/components/features/projects/ProjectFormField";
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

/** Tanggal hari ini dalam format YYYY-MM-DD, dipakai sebagai batas bawah input date
 *  (menolak tanggal lampau langsung di browser, cermin dari aturan server). */
function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
    const [state, formAction] = useActionState(createProjectAction, INITIAL_PROJECT_FORM_STATE);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
            onClose();
        }
    }, [state, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Buat proyek baru">
            <form ref={formRef} action={formAction} className="flex flex-col gap-4" noValidate>
                <AuthErrorBanner message={state.error} />

                <ProjectFormField
                    id="title"
                    name="title"
                    label="Judul proyek"
                    type="text"
                    icon={FolderPlus}
                    placeholder="Website Redesign"
                    autoComplete="off"
                    required
                    defaultValue={state.values?.title}
                    error={state.fieldErrors?.title}
                />

                <ProjectFormField
                    id="deadline"
                    name="deadline"
                    label="Deadline"
                    type="date"
                    icon={CalendarDays}
                    min={getTodayDateString()}
                    required
                    defaultValue={state.values?.deadline}
                    error={state.fieldErrors?.deadline}
                />

                <label htmlFor="allowFreeSwap" className="flex items-center gap-2.5">
                    <input
                        id="allowFreeSwap"
                        name="allowFreeSwap"
                        type="checkbox"
                        defaultChecked={state.values?.allowFreeSwap}
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