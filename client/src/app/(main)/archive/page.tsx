import { getArchivedProjects } from "@/lib/api/projects/projects";
import { getSession } from "@/lib/api/auth/session";
import ArchiveProjectList from "@/components/features/archive/ArchiveProjectList";

export default async function ArchivePage() {
    const [projects, user] = await Promise.all([
        getArchivedProjects(),
        getSession(),
    ]);

    return (
        <>
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">
                    Arsip Proyek
                </h2>
            </div>

            <p className="mt-1 text-sm font-inter text-muted">
                Proyek yang sudah diarsipkan disembunyikan dari daftar proyek aktif,
                tapi datanya tetap tersimpan.
            </p>

            <div className="mt-4">
                <ArchiveProjectList
                    projects={projects}
                    currentUserId={user?.id ?? null}
                />
            </div>
        </>
    );
}