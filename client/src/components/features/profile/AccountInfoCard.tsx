import { Info } from "lucide-react";
import SettingsSection from "@/components/features/settings/SettingsSection";

type AccountInfoCardProps = {
    createdAt: string;
};

function formatJoinedDate(createdAt: string) {
    return new Date(createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function AccountInfoCard({ createdAt }: AccountInfoCardProps) {
    return (
        <SettingsSection icon={Info} title="Info Akun">
            <dl className="flex items-center justify-between gap-3 text-sm font-inter">
                <dt className="text-muted">Bergabung sejak</dt>
                <dd className="font-medium text-foreground">{formatJoinedDate(createdAt)}</dd>
            </dl>
        </SettingsSection>
    );
}
