"use client";

import { useEffect } from "react";
import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react";
import { ROUTES } from "@/lib/routes";

type MainErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function MainError({ error, reset }: MainErrorProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="px-4 mt-2">
            <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-secondary sm:size-20">
                    <AlertTriangleIcon className="size-8 text-muted sm:size-9" strokeWidth={1.5} />
                </div>

                <div className="flex flex-col gap-2">
                    <p className="font-inter text-sm font-semibold tracking-wide text-primary">
                        Terjadi kesalahan
                    </p>
                    <h1 className="font-inter text-xl font-semibold text-foreground sm:text-2xl">
                        Ada yang tidak beres
                    </h1>
                    <p className="max-w-sm font-inter text-sm text-muted sm:text-base">
                        Halaman ini gagal dimuat. Coba muat ulang, atau kembali ke daftar
                        proyek kalau masalah masih berlanjut.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={reset}
                        className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                        <RotateCcwIcon className="size-4" />
                        Coba lagi
                    </button>
                    <a
                        href={ROUTES.PROJECTS}
                        className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-inter font-medium text-foreground transition-colors hover:border-primary"
                    >
                        Ke daftar proyek
                    </a>
                </div>
            </div>
        </div>
    );
}
