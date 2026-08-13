import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export default function RootNotFound() {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-background px-4 text-center">
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
                    Halaman yang kamu cari mungkin sudah dipindah, dihapus, atau memang
                    belum pernah ada.
                </p>
            </div>

            <Link
                href={ROUTES.PROJECTS}
                className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
                Kembali ke beranda
            </Link>
        </div>
    );
}
