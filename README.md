# KerjainYu — Workfolder (client + server)

Ini adalah struktur kerja awal untuk proyek KerjainYu. Folder dibuat terpisah untuk client (Next.js dengan App Router) dan server (Node.js 22). Struktur ini dimaksudkan sebagai starting point yang rapi untuk pengembangan frontend dan backend secara terpisah.

Struktur direktori (singkat):

- client/        # Next.js 16.4 dengan App Router
  - app/
    - layout.js
    - page.js
  - globals.css
  - package.json
  - next.config.js

- server/        # Node.js 22 - HTTP API minimal
  - src/
    - index.js
    - routes.js
  - package.json

Cara menjalankan (lokal):

1. Jalankan server (port 3001):
   cd server
   npm install
   npm run start

2. Jalankan client (port 3000):
   cd client
   npm install
   npm run dev

Catatan:
- Server dibuat menggunakan modul standar Node.js (http) agar kompatibel dengan Node 22 tanpa ketergantungan eksternal.
- Client menggunakan Next.js (app router) — file contoh menggunakan `app/layout.js` dan `app/page.js`.

Selamat mengembangkan!
