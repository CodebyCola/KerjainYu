"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { SlidersHorizontal, FolderPen, CalendarDays, Loader2, Check } from "lucide-react";
import { updateProjectSettingsAction } from "@/app/(main)/projects/[projectId]/settings/actions";
import { initialProjectSettingsFormState, ProjectSettingsFormValues } from "@/lib/api/projects/projectSettingsFormState";
import ProjectFormField from "@/components/features/projects/ProjectFormField";
import AuthErrorBanner from "@/components/features/auth/AuthErrorBanner";
import SettingsSection from "@/components/features/settings/SettingsSection";

type GeneralSettingsCardProps = {
    projectId: string;
    initialValues: ProjectSettingsFormValues;
    canManage: boolean;
};

function SaveButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-5"
        >
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {pending ? "Menyimpan..." : "Simpan perubahan"}
        </button>
    );
}

export default function GeneralSettingsCard({ projectId, initialValues, canManage }: GeneralSettingsCardProps) {
    async function handleSubmit(prevState: ReturnType<typeof initialProjectSettingsFormState>, formData: FormData) {
        return updateProjectSettingsAction(projectId, prevState, formData);
    }

    const [state, formAction] = useActionState(handleSubmit, initialProjectSettingsFormState(initialValues));

    return (
        <SettingsSection
            icon={SlidersHorizontal}
            title="Pengaturan Umum"
            description="Detail dasar proyek yang terlihat oleh seluruh anggota."
        >
            <fieldset disabled={!canManage} className="flex flex-col gap-4 disabled:opacity-60">
                <form action={formAction} className="flex flex-col gap-4" noValidate>
                    <AuthErrorBanner message={state.error} />

                    <ProjectFormField
                        id="title"
                        name="title"
                        label="Nama proyek"
                        type="text"
                        icon={FolderPen}
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
                        required
                        defaultValue={state.values?.deadline}
                        error={state.fieldErrors?.deadline}
                    />

                    <label htmlFor="allowFreeSwap" className="flex items-start gap-2.5">
                        <input
                            id="allowFreeSwap"
                            name="allowFreeSwap"
                            type="checkbox"
                            defaultChecked={state.values?.allowFreeSwap}
                            className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary"
                        />
                        <span className="text-sm font-inter text-foreground">
                            Izinkan anggota bertukar tugas secara bebas
                            <span className="block text-xs font-inter text-muted">
                                Anggota bisa saling tukar tugas tanpa persetujuan ketua.
                            </span>
                        </span>
                    </label>

                    <div className="flex items-center gap-3">
                        <SaveButton />
                        {state.success && (
                            <span className="flex items-center gap-1 text-xs font-inter text-status-done-text">
                                <Check className="size-3.5" />
                                Tersimpan
                            </span>
                        )}
                    </div>
                </form>
            </fieldset>

            {!canManage && (
                <p className="mt-3 text-xs font-inter text-muted">
                    Hanya ketua proyek yang bisa mengubah pengaturan ini.
                </p>
            )}
        </SettingsSection>
    );
}
