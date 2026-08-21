import { Settings } from "lucide-react";

type SettingsHeaderProps = {
    projectTitle: string;
};

export default function SettingsHeader({ projectTitle }: SettingsHeaderProps) {
    return (
        <div>
            <h2 className="flex items-center gap-2 font-inter text-xl font-semibold text-foreground md:text-2xl">
                <Settings className="size-5 text-muted" />
                Pengaturan
            </h2>
            <p className="mt-1 text-sm font-inter text-muted">{projectTitle}</p>
        </div>
    );
}
