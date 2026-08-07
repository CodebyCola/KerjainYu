# KerjainYu — Server (Backend)

Backend API untuk KerjainYu. Dokumen ini isinya cara setup project ini dari nol setelah `git pull`/`git clone`, biar semua anggota tim (FE maupun BE) bisa langsung jalan tanpa nebak-nebak.

---

## 1. Prasyarat

Pastikan sudah ter-install di komputer kamu:

| Tool           | Cek versi   | Link install                                   |
| -------------- | ----------- | ---------------------------------------------- |
| Node.js (LTS)  | `node -v`   | https://nodejs.org                             |
| npm            | `npm -v`    | (ikut Node.js)                                 |
| Docker Desktop | `docker -v` | https://www.docker.com/products/docker-desktop |
| Git            | `git -v`    | https://git-scm.com                            |

> ⚠️ **Penting:** kalau kamu pernah install PostgreSQL secara lokal/manual sebelumnya (bukan lewat Docker), **matikan service-nya dulu** sebelum lanjut — dia bisa bentrok rebutan port `5432` dengan database Docker project ini. Cek lewat `services.msc` di Windows, cari service `postgresql-x64-...`, klik kanan → Stop.

---

## 2. Setup awal (sekali saja)

```bash
# 1. Clone repo (skip kalau sudah pernah clone)
git clone <url-repo-ini>
cd KerjainYu/server

# 2. Install semua dependency
npm install

# 3. Copy file environment variable
cp .env.example .env
```

Buka `.env` yang baru dibuat, isinya sudah default cocok untuk development lokal — **tidak perlu diubah** kecuali kamu sengaja mau custom port/kredensial.

```bash
# 4. Nyalain database (PostgreSQL via Docker)
npm run db:up

# 5. Jalanin migration, biar tabel-tabel ter-generate di database
npm run migrate:up

# 6. Jalanin server development
npm run dev
```

Kalau berhasil, di terminal bakal muncul:

```
Server is running on PORT 3000
Database connected
```

Test dengan buka browser/Postman ke: `http://localhost:3000/health` — harus muncul:

```json
{ "success": true, "message": "Server is running" }
```

---

## 3. Setiap kali mau kerja (bukan setup pertama kali)

```bash
git pull                # ambil perubahan terbaru
npm install              # jaga-jaga ada package baru yang ditambahkan
npm run db:up             # nyalain database (kalau belum nyala)
npm run migrate:up        # jaga-jaga ada tabel/kolom baru
npm run dev                # jalanin server
```

Untuk matiin database kalau sudah selesai kerja (opsional, boleh dibiarin nyala juga):

```bash
npm run db:down
```

---

## 4. Struktur folder

```
src/
├── config/
│   └── db.ts            # koneksi Knex ke database
├── controllers/          # terima request, panggil service, format response
├── services/              # logic bisnis + query database
├── routes/                # daftar endpoint per resource
├── schemas/                # Zod schema untuk validasi input
├── middlewares/
│   ├── errorHandler.ts    # tangkap semua error, format response seragam
│   └── validate.ts        # jalanin Zod schema sebelum masuk controller
├── errors/
│   └── AppError.ts        # custom error class (NotFoundError, UnauthorizedError, dst)
├── migrations/             # riwayat perubahan skema database (Knex)
└── index.ts                 # entry point aplikasi
```

---

## 5. Format response API

Semua endpoint mengikuti format yang sama, supaya FE bisa handle secara generic.

**Sukses:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User tidak ditemukan",
    "httpStatus": 404
  }
}
```

FE sebaiknya switch berdasarkan `error.code`, bukan `error.message` (karena teks message bisa berubah kapan saja tanpa mematahkan logic FE).

Base URL untuk semua endpoint: `http://localhost:3000/api/v1`

Daftar lengkap fitur, endpoint, dan kode error ada di `PROJECT_DOCUMENTATION.md`.

---

## 6. Perintah yang tersedia (`npm run ...`)

| Command            | Fungsi                                                        |
| ------------------ | ------------------------------------------------------------- |
| `dev`              | Jalanin server dengan auto-restart tiap ada perubahan file    |
| `build`            | Compile TypeScript ke JavaScript (folder `dist/`)             |
| `start`            | Jalanin hasil build (`dist/index.js`) — dipakai di production |
| `db:up`            | Nyalain container database (Docker)                           |
| `db:down`          | Matiin container database                                     |
| `migrate:make`     | Bikin file migration baru                                     |
| `migrate:up`       | Jalanin migration yang belum diterapkan ke database           |
| `migrate:rollback` | Batalin migration terakhir                                    |

---

## 7. Troubleshooting

**Error `password authentication failed for user "..."` padahal `.env` dan `docker-compose.yml` sudah cocok:**
Kemungkinan besar ada PostgreSQL lain (non-Docker) yang jalan dan rebutan port `5432`. Cek dengan:

```bash
netstat -ano | findstr :5432
```

Kalau muncul lebih dari satu proses, matikan service PostgreSQL lokal lewat `services.msc`, lalu coba lagi.

**Command seperti `tsx`/`knex` "is not recognized":**
Package-nya kemungkinan belum ke-install beneran walau tercatat di `package.json`. Cek dengan `npm ls <nama-package>`, kalau hasilnya `(empty)`, install manual: `npm install -D <nama-package>`.

**Error TypeScript `Cannot find name 'process'` atau `Could not find a declaration file for module 'express'`:**
Kurang `@types/node` atau `@types/express`. Install: `npm install -D @types/node @types/express`.

---

## 8. Tech stack

- Express.js — web framework
- TypeScript — bahasa utama
- Knex — query builder
- PostgreSQL (via Docker) — database
- Zod — validasi input
- tsx — dev runtime dengan hot-reload

Detail lengkap ada di `PROJECT_DOCUMENTATION.md`.
