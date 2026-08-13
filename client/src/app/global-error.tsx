"use client";

import { useEffect } from "react";
import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react";

type GlobalErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="id" className="antialiased">
            <body>
                <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-background px-4 text-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-secondary sm:size-20">
                        <AlertTriangleIcon className="size-8 text-muted sm:size-9" strokeWidth={1.5} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="font-inter text-sm font-semibold tracking-wide text-primary">
                            Terjadi kesalahan
                        </p>
                        <h1 className="font-inter text-xl font-semibold text-foreground sm:text-2xl">
                            Aplikasi gagal dimuat
                        </h1>
                        <p className="max-w-sm font-inter text-sm text-muted sm:text-base">
                            Terjadi kesalahan yang tidak terduga. Coba muat ulang halaman.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={reset}
                        className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                        <RotateCcwIcon className="size-4" />
                        Coba lagi
                    </button>
                </div>
            </body>
        </html>
    );
}
