import { API_BASE_URL } from "@/lib/env";

// File ini KHUSUS untuk proses refresh access token, dipisah dari
// lib/api/auth/auth.ts karena dipakai dari dua konteks yang beda:
//   1. Middleware (proxy.ts) — jalan di Edge Runtime, BUKAN React Server
//      Component context, jadi tidak boleh bergantung pada helper yang
//      di-guard dengan package "server-only" (seperti apiFetch/fetcher.ts).
//   2. getSession() (Server Component) — sebagai fallback kalau ternyata
//      middleware belum sempat refresh (misal race condition).
//
// PRINSIP PENTING: file ini TIDAK PERNAH menentukan sendiri apakah sebuah
// token "valid" atau "expired". Itu murni keputusan backend. Di sini kita
// cuma mengirim apa yang ada (accessToken/refreshToken cookie) ke backend,
// dan mempercayai jawabannya:
//   - backend bilang OK  -> pakai Set-Cookie baru yang backend kirim
//   - backend bilang gagal -> anggap sesi benar-benar habis
// Tidak ada decode JWT, tidak ada cek `exp`, tidak ada logic expired di FE.

export type RefreshResult =
  | { ok: true; setCookies: string[] }
  | { ok: false };

export async function callRefreshToken(cookieHeader: string): Promise<RefreshResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false };
    }

    return { ok: true, setCookies: response.headers.getSetCookie() };
  } catch {
    // Backend tidak bisa dihubungi (network error, dsb). Perlakukan sama
    // seperti refresh gagal — bukan tanggung jawab FE untuk menebak alasan.
    return { ok: false };
  }
}