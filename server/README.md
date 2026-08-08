# KerjainYu — Server (Backend)

Backend API untuk KerjainYu. Dokumen ini isinya cara setup project ini dari nol setelah `git pull`/`git clone`, beserta konfigurasi spesifik yang dipakai project ini.

---

## 1. Prasyarat

| Tool           | Cek versi   | Link install                                   |
| -------------- | ----------- | ---------------------------------------------- |
| Node.js (LTS)  | `node -v`   | https://nodejs.org                             |
| npm            | `npm -v`    | (ikut Node.js)                                 |
| Docker Desktop | `docker -v` | https://www.docker.com/products/docker-desktop |
| Git            | `git -v`    | https://git-scm.com                            |

> ⚠️ **Penting:** kalau kamu pernah install PostgreSQL secara lokal/manual, **matikan service-nya dulu** — dia bisa bentrok rebutan port `5432` dengan database Docker project ini. Cek lewat `services.msc` (Windows), cari service `postgresql-x64-...`, klik kanan → Stop.
>
> ⚠️ Port `5000` juga cukup sering bentrok dengan service lain di beberapa sistem (mis. AirPlay Receiver di macOS, atau service Windows tertentu). Kalau `/health` mengembalikan error aneh (403, connection refused, dsb) padahal server "Up", cek dulu dengan `netstat -ano | findstr :5000` — kalau muncul lebih dari satu proses di port itu, ganti `PORT` di `.env` ke angka lain (mis. `4000`).

---

## 2. Setup awal (sekali saja)

```bash
git clone <url-repo-ini>
cd KerjainYu/server
npm install
cp .env.example .env
```

Isi `.env`:

```env
PORT=5000
DATABASE_URL=postgresql://kerjainyu:kerjainyu123@localhost:5432/kerjainyu_db
```

> Frontend (client) jalan di port `3000` secara terpisah. Backend **sengaja** dipisah ke `5000` supaya tidak bentrok dengan dev server frontend.

```bash
npm run db:up          # nyalain PostgreSQL via Docker
npm run migrate:up     # generate semua tabel di database
npm run dev             # jalanin server development
```

Berhasil kalau muncul:

```
Server is running on PORT 5000
Database connected
```

Test: buka `http://localhost:5000/health` di browser, harus muncul:

```json
{ "success": true, "message": "Server is running" }
```

---

## 3. Setiap kali mau kerja

```bash
git pull
npm install              # jaga-jaga ada package baru
npm run db:up
npm run migrate:up        # jaga-jaga ada migration baru
npm run dev
```

Matikan database kalau sudah selesai (opsional):

```bash
npm run db:down
```

---

## 4. Struktur folder

```
server/
├── src/
│   ├── database/
│   │   ├── db.ts                 # koneksi Knex + konversi camelCase <-> snake_case
│   │   ├── knexfile.js            # config Knex CLI (WAJIB .js, lihat catatan di bawah)
│   │   ├── migrations/            # file migration (.js)
│   │   └── repositories/          # query database per resource
│   ├── controllers/                # terima request, panggil service, format response
│   ├── services/                    # logic bisnis
│   ├── routes/                       # daftar endpoint per resource
│   ├── schemas/                       # Zod schema validasi input
│   ├── middlewares/
│   │   ├── errorHandler.ts            # tangkap semua error, format response seragam
│   │   ├── validate.ts                 # jalanin Zod schema sebelum masuk controller
│   │   ├── auth.middlewares.ts          # cek JWT dari cookie
│   │   └── rateLimiter.ts                # authLimiter untuk endpoint sensitif
│   ├── errors/
│   │   └── AppError.ts                    # AppError + subclass (NotFoundError, dst)
│   ├── lib/
│   │   └── jwt.ts                          # generate & verify token
│   └── index.ts                             # entry point
├── knexfile.js dan migrations HARUS .js — lihat "Kenapa migration pakai .js" di bawah
├── docker-compose.yml
└── package.json
```

---

## 5. Konvensi penamaan: snake_case (DB) ↔ camelCase (kode)

Kolom database pakai `snake_case`, semua variabel/JSON di kode (backend & frontend) pakai `camelCase`. Konversi dilakukan **otomatis** di `src/database/db.ts` lewat `wrapIdentifier` + `postProcessResponse` bawaan Knex — **bukan** pakai package `knex-stringcase` (package itu ESM-only dan bentrok dengan setup CommonJS project ini).

```ts
// src/database/db.ts (ringkasan)
export const db = knex({
  client: "pg",
  connection: process.env.DATABASE_URL,
  wrapIdentifier: (value, origImpl) => {
    if (value === "*") return origImpl(value); // JANGAN transform "*" — lihat catatan di bawah
    return origImpl(snakeCase(value));
  },
  postProcessResponse: (result) => toCamelCase(result),
});
```

> ⚠️ **Jangan hapus pengecualian `value === '*'`.** Tanpa itu, query apapun yang pakai `.returning('*')` atau `select('*')` akan error (`snakeCase('*')` menghasilkan string kosong, bikin query SQL invalid). Kalau nanti menambah logic baru di `wrapIdentifier`, selalu cek dulu apakah simbol-simbol SQL lain (`*`, alias, dll) ikut ke-mangle.

Developer **tidak perlu** menulis mapping manual — tulis `fullName` di kode, otomatis tersimpan sebagai `full_name` di database, dan otomatis kembali jadi `fullName` saat dibaca lagi. Detail lengkap di `NAMING_MAPPING.md`.

---

## 6. Kenapa migration & knexfile pakai `.js`, bukan `.ts`

Server aplikasi (`index.ts`, dll) berjalan lewat `tsx`, yang bisa langsung menjalankan TypeScript. **Tapi Knex CLI (`knex migrate:latest`, dll) adalah proses terpisah** yang tidak lewat `tsx` — dia butuh loader sendiri (`ts-node`, dsb) untuk baca file `.ts`, dan di Windows loader ini sering gagal dimuat (`Failed to load external module ts-node/register`, dst).

**Solusi yang dipakai project ini:** `knexfile.js` dan semua file di `src/database/migrations/` ditulis sebagai **CommonJS `.js` biasa**, bukan `.ts`. Ini bukan kompromi kualitas — migration jarang butuh type-checking kompleks, dan pendekatan ini jauh lebih stabil lintas OS.

```js
// src/database/knexfile.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") }); // path eksplisit, WAJIB — Knex CLI pindah working directory ke src/database

module.exports = {
  client: "pg",
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: path.join(__dirname, "migrations"),
    extension: "js",
  },
  seeds: { directory: path.join(__dirname, "seeds") },
};
```

> ⚠️ Setiap migration WAJIB `return` hasil `knex.schema...` di `exports.up`/`exports.down`. Kalau lupa, migration tetap "berhasil" tapi Knex memberi warning `did not return a promise` dan tidak bisa menjamin urutan eksekusi dengan benar.

---

## 7. Format response API

**Sukses:**

```json
{ "success": true, "data": { ... } }
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Username must be at least 3 characters",
    "httpStatus": 400,
    "fields": { "username": "Username must be at least 3 characters" }
  }
}
```

FE switch berdasarkan `error.code`, bukan `error.message`. `error.fields` (kalau ada) dipakai untuk menunjuk error ke input form yang tepat.

Base URL: `http://localhost:5000/api/v1`

Error di-generate lewat `AppError` dan subclass-nya (`NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`, `ConflictError`) di `src/errors/AppError.ts` — pakai subclass yang sesuai, jangan `throw new AppError(...)` manual.

---

## 8. Autentikasi

- Token JWT disimpan di **httpOnly cookie** (`token`), bukan localStorage — di-set saat `/auth/login` berhasil.
- `authenticate` middleware (`src/middlewares/auth.middlewares.ts`) membaca cookie ini, verify JWT, lalu isi `req.user = { id, username }`.
- Route yang butuh login pasang `authenticate` di depan `validate(schema)`:
  ```ts
  router.patch(
    "/me",
    authenticate,
    validate(updateUserSchema),
    authController.updateProfile,
  );
  ```
- Endpoint sensitif (`/register`, `/login`, `/me/password`) dipasangi `authLimiter` (rate limiting) untuk mencegah brute-force.
- **Ganti password dipisah dari update profil** (`/me/password`, bukan bagian dari `/me`) dan wajib mengirim `currentPassword` untuk verifikasi — demi keamanan.

---

## 9. Testing manual (Thunder Client)

1. Pastikan `npm run dev` sedang jalan.
2. Test `GET http://localhost:5000/health` dulu — pastikan server hidup sebelum test endpoint lain.
3. Test `POST http://localhost:5000/api/v1/auth/register` dengan body JSON `{ "username": "...", "password": "..." }` (password: min. 8 karakter, 1 huruf besar, 1 angka).
4. Test `POST http://localhost:5000/api/v1/auth/login` — cek tab **Cookies** di response, harus muncul cookie `token`.
5. Test endpoint yang butuh auth (mis. `GET /api/v1/auth/me`) — Thunder Client otomatis membawa cookie dari request sebelumnya selama masih di collection/environment yang sama.

Semua endpoint tidak diawali `/api/v1`, **kecuali** `/health`.

---

## 10. Perintah yang tersedia

| Command               | Fungsi                                               |
| --------------------- | ---------------------------------------------------- |
| `dev`                 | Jalanin server, auto-restart tiap ada perubahan file |
| `build`               | Compile TypeScript ke JavaScript (`dist/`)           |
| `start`               | Jalanin hasil build — dipakai di production          |
| `db:up` / `db:down`   | Nyalain / matiin container database                  |
| `migrate:make <nama>` | Bikin file migration baru (`.js`)                    |
| `migrate:up`          | Jalanin migration yang belum diterapkan              |
| `migrate:rollback`    | Batalin migration terakhir                           |

---

## 11. Troubleshooting

**`password authentication failed` padahal `.env` & `docker-compose.yml` sudah cocok:**
Ada PostgreSQL lain (non-Docker) rebutan port `5432`. Cek `netstat -ano | findstr :5432`, matikan service PostgreSQL lokal lewat `services.msc`.

**`/health` di browser mengembalikan 403 / connection refused / lambat tak berujung:**
Kemungkinan ada proses lain yang menempati port yang sama dengan `PORT` di `.env`. Cek `netstat -ano | findstr :5000`. Kalau muncul lebih dari satu proses, ganti `PORT` ke angka lain.

**`tsx`/`knex`/`@types/...` "is not recognized" atau "Cannot find module":**
Package tercatat di `package.json` tapi belum benar-benar ter-install (sering terjadi akibat `npm init` dijalankan berkali-kali di awal). Cek `npm ls <nama-package>` — kalau `(empty)`, install manual: `npm install -D <nama-package>`.

**`Failed to load external module ts-node/register` saat `npm run migrate:up`:**
Knex CLI tidak bisa membaca `knexfile.ts`. Pastikan `knexfile.js` dan semua migration ditulis dalam `.js` (CommonJS) — lihat section 6.

**`insert into "users" (...) returning "" - zero-length delimited identifier`:**
Bug dari fungsi `wrapIdentifier` custom di `db.ts` — pastikan ada pengecualian untuk `value === '*'` (lihat section 5). Tanpa ini, `.returning('*')` akan selalu error.

**Migration warning `did not return a promise`:**
File migration lupa `return` di `exports.up`/`exports.down`. Rollback (`npm run migrate:rollback`), perbaiki file-nya, jalankan `migrate:up` lagi.

**Env variable tidak terbaca saat `npm run migrate:*` (`injected env (0)`):**
Knex CLI memindahkan working directory ke lokasi `knexfile.js` sebelum baca `.env`. Pastikan `knexfile.js` memuat `.env` dengan path eksplisit (`path.join(__dirname, '../../.env')`), bukan mengandalkan auto-detect.

---

## 12. Tech stack

- Express.js — web framework
- TypeScript — bahasa utama (aplikasi), CommonJS `.js` untuk Knex CLI (migration/knexfile)
- Knex — query builder, dengan `wrapIdentifier`/`postProcessResponse` custom untuk camelCase ↔ snake_case
- PostgreSQL 16 (via Docker) — database
- Zod — validasi input
- bcrypt — hashing password
- jsonwebtoken — autentikasi (disimpan di httpOnly cookie)
- cookie-parser, cors — middleware Express
- tsx — dev runtime dengan hot-reload

Skema database lengkap: `database.dbml`, dipublish lewat dbdocs (lihat `NAMING_MAPPING.md` untuk link & cara update). Detail fitur & tech stack lengkap: `PROJECT_DOCUMENTATION.md`.
