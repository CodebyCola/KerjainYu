"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { ClipboardList, CalendarDays, ListOrdered, Loader2 } from "lucide-react";
import { createTaskAction } from "@/app/(main)/projects/[projectId]/task-board/actions";
import { INITIAL_TASK_FORM_STATE } from "@/lib/api/tasks/taskFormState";
import TaskFormField from "@/components/features/tasks/TaskFormField";
import TaskDescriptionField from "@/components/features/tasks/TaskDescriptionField";
import AuthErrorBanner from "@/components/features/auth/AuthErrorBanner";
import Modal from "@/components/ui/Modal";

type CreateTaskModalProps = {
    projectId: string;
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
            {pending ? "Membuat..." : "Buat tugas"}
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

export default function CreateTaskModal({ projectId, isOpen, onClose }: CreateTaskModalProps) {
    const createTaskForProject = createTaskAction.bind(null, projectId);
    const [state, formAction] = useActionState(createTaskForProject, INITIAL_TASK_FORM_STATE);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
            onClose();
        }
    }, [state, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Buat tugas baru">
            <form ref={formRef} action={formAction} className="flex flex-col gap-4" noValidate>
                <AuthErrorBanner message={state.error} />

                <TaskFormField
                    id="title"
                    name="title"
                    label="Judul tugas"
                    type="text"
                    icon={ClipboardList}
                    placeholder="Buat testing aplikasi"
                    autoComplete="off"
                    required
                    defaultValue={state.values?.title}
                    error={state.fieldErrors?.title}
                />

                <TaskDescriptionField
                    id="description"
                    name="description"
                    label="Deskripsi"
                    placeholder="Jelaskan detail tugas ini (opsional)"
                    defaultValue={state.values?.description}
                    error={state.fieldErrors?.description}
                />

                <div className="grid grid-cols-2 gap-3">
                    <TaskFormField
                        id="priority"
                        name="priority"
                        label="Prioritas"
                        type="number"
                        icon={ListOrdered}
                        placeholder="1"
                        min="1"
                        defaultValue={state.values?.priority}
                        error={state.fieldErrors?.priority}
                    />

                    <TaskFormField
                        id="deadline"
                        name="deadline"
                        label="Deadline"
                        type="date"
                        icon={CalendarDays}
                        min={getTodayDateString()}
                        defaultValue={state.values?.deadline}
                        error={state.fieldErrors?.deadline}
                    />
                </div>

                <p className="text-xs font-inter text-muted">
                    Tugas baru masuk ke kolom &quot;Belum diklaim&quot; — anggota tim bisa mengklaimnya sendiri.
                </p>

                <SubmitButton />
            </form>
        </Modal>
    );
}
