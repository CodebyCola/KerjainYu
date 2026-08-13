import Link from "next/link";
import { CompassIcon, LayoutGridIcon, ListChecksIcon } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { getSession } from "@/lib/api/auth/session";
import { SessionProvider } from "@/contexts/SessionContext";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";

export default async function MainNotFound() {
    const user = await getSession();

    return (
        <SessionProvider user={user}>
            <ResponsiveLayout user={user ?? undefined}>
                <div className="px-4 mt-2">
                    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-secondary sm:size-20">
                            <CompassIcon className="size-8 text-muted sm:size-9" strokeWidth={1.5} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="font-inter text-sm font-semibold tracking-wide text-primary">
                                404
                            </p>
                            <h1 className="font-inter text-xl font-semibold text-foreground sm:text-2xl">
                                Halaman tidak ditemukan
                            </h1>
                            <p className="max-w-sm font-inter text-sm text-muted sm:text-base">
                                Halaman yang kamu cari mungkin sudah dipindah, dihapus, atau
                                memang belum pernah ada.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href={ROUTES.PROJECTS}
                                className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90"
                            >
                                <LayoutGridIcon className="size-4" />
                                Ke daftar proyek
                            </Link>
                            <Link
                                href={ROUTES.MY_TASK}
                                className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-inter font-medium text-foreground transition-colors hover:border-primary"
                            >
                                <ListChecksIcon className="size-4" />
                                Ke tugas saya
                            </Link>
                        </div>
                    </div>
                </div>
            </ResponsiveLayout>
        </SessionProvider>
    );
}
