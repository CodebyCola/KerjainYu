"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { UserRound, AtSign, Mail, Loader2, Check } from "lucide-react";
import { updateProfileAction } from "@/app/(main)/profile/actions";
import { initialProfileFormState, ProfileFormValues } from "@/lib/api/auth/profileFormState";
import AuthField from "@/components/features/auth/AuthField";
import AuthErrorBanner from "@/components/features/auth/AuthErrorBanner";
import AvatarPreviewField from "@/components/features/profile/AvatarPreviewField";
import SettingsSection from "@/components/features/settings/SettingsSection";

type EditProfileCardProps = {
    initialValues: ProfileFormValues;
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

export default function EditProfileCard({ initialValues }: EditProfileCardProps) {
    const [state, formAction] = useActionState(updateProfileAction, initialProfileFormState(initialValues));

    return (
        <SettingsSection
            icon={UserRound}
            title="Informasi Profil"
            description="Data ini bisa dilihat oleh anggota tim di proyek yang kamu ikuti."
        >
            <form action={formAction} className="flex flex-col gap-4" noValidate>
                <AuthErrorBanner message={state.error} />

                <AuthField
                    id="username"
                    name="username"
                    label="Username"
                    type="text"
                    icon={AtSign}
                    placeholder="Minimal 3 karakter"
                    autoComplete="username"
                    defaultValue={state.values?.username}
                    error={state.fieldErrors?.username}
                />

                <AuthField
                    id="fullName"
                    name="fullName"
                    label="Nama lengkap"
                    type="text"
                    icon={UserRound}
                    placeholder="Nama yang ditampilkan ke tim"
                    autoComplete="name"
                    defaultValue={state.values?.fullName}
                    error={state.fieldErrors?.fullName}
                />

                <AuthField
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    icon={Mail}
                    placeholder="nama@email.com"
                    autoComplete="email"
                    defaultValue={state.values?.email}
                    error={state.fieldErrors?.email}
                />

                <AvatarPreviewField
                    id="avatarUrl"
                    name="avatarUrl"
                    label="Foto profil (URL)"
                    placeholder="https://contoh.com/foto.jpg"
                    defaultValue={state.values?.avatarUrl}
                    fallbackLabel={state.values?.fullName || state.values?.username || "?"}
                    error={state.fieldErrors?.avatarUrl}
                />

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
        </SettingsSection>
    );
}
