import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import AuthSuccessBanner from "@/components/features/auth/AuthSuccessBanner";
import LoginForm from "./LoginForm";

type LoginPageProps = {
    searchParams: Promise<{ registered?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const { registered } = await searchParams;

    return (
        <div className="flex flex-col" style={{ gap: "clamp(0.5rem, 2.2vh, 1.125rem)" }}>
            <div className="text-center">
                <h1
                    className="font-inter font-semibold text-foreground"
                    style={{ fontSize: "clamp(0.95rem, 3vh, 1.25rem)" }}
                >
                    Selamat datang kembali
                </h1>
                <p
                    className="mt-1 font-inter text-muted"
                    style={{ fontSize: "clamp(0.75rem, 2vh, 0.875rem)" }}
                >
                    Masuk untuk melanjutkan ke workspace kamu.
                </p>
            </div>

            {registered && (
                <AuthSuccessBanner message="Akun berhasil dibuat. Silakan login." />
            )}

            <LoginForm />

            <p className="text-center text-sm font-inter text-muted">
                Belum punya akun?{" "}
                <Link href={ROUTES.REGISTER} className="font-medium text-primary hover:underline">
                    Daftar sekarang
                </Link>
            </p>
        </div>
    );
}