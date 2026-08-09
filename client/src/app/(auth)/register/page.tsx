import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
    return (
        <div className="flex flex-col" style={{ gap: "clamp(0.5rem, 2.2vh, 1.125rem)" }}>
            <div className="text-center">
                <h1
                    className="font-inter font-semibold text-foreground"
                    style={{ fontSize: "clamp(0.95rem, 3vh, 1.25rem)" }}
                >
                    Buat akun baru
                </h1>
                <p
                    className="mt-1 font-inter text-muted"
                    style={{ fontSize: "clamp(0.75rem, 2vh, 0.875rem)" }}
                >
                    Mulai kelola project dan task tim kamu di sini.
                </p>
            </div>

            <RegisterForm />

            <p className="text-center text-sm font-inter text-muted">
                Sudah punya akun?{" "}
                <Link href={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
                    Login di sini
                </Link>
            </p>
        </div>
    );
}