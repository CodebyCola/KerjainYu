# Ringkasan Perubahan

Dokumen ini merangkum seluruh perubahan yang dilakukan berdasarkan `TASK_FEATURE_HARDENING_PLAN.md`. Perubahan mencakup 6 task perbaikan bug/celah pada fitur Task (backend dan frontend). Setiap bagian di bawah dikelompokkan per task sesuai rencana kerja, disertai file yang diubah dan alasan perubahannya.

---

## Task 1 — Menutup celah bypass state machine pada `PATCH /api/v1/tasks/:id`

**Masalah:** Endpoint `PATCH /api/v1/tasks/:id` seharusnya hanya untuk mengubah field biasa (title, description, priority, deadline), namun sebelumnya field `status` masih bisa dikirim lewat endpoint ini sehingga status task bisa diubah langsung tanpa melalui validasi transisi, atomic update, maupun efek samping (notifikasi, log kepemilikan) yang seharusnya hanya terjadi lewat endpoint transisi khusus (`/claim`, `/ongoing`, `/submissions`, `/review`).

**File yang diubah:**
- `server/src/schemas/task.schema.ts` — menghapus field `status` dari `updateTaskSchema`. Karena schema menggunakan `.strict()`, pengiriman `status` lewat endpoint ini sekarang otomatis ditolak dengan `400 VALIDATION_ERROR`.
- `server/src/docs/task.docs.ts` — memperjelas deskripsi endpoint pada dokumentasi Swagger bahwa endpoint ini tidak bisa mengubah status.
- `server/src/tests/integration/task.test.ts` — memperbaiki test yang sebelumnya mengandalkan perilaku bug (mengirim `status` lewat endpoint ini dan berharap berhasil), menyesuaikan dua test lain yang tidak sengaja ikut mengirim `status` di body-nya, serta menambahkan dua test baru: penolakan field `status` pada endpoint update biasa, dan pembaruan sebagian field tanpa memengaruhi field lain.

**Dampak ke frontend:** Tidak ada perubahan. Sudah dipastikan lewat pencarian kode bahwa alur update task di frontend tidak pernah mengirim field `status` melalui endpoint update biasa.

---

## Task 2 — Memblokir aksi task pada project yang sudah diarsipkan/selesai

**Masalah:** Tidak ada satu pun pemeriksaan otorisasi yang memvalidasi apakah project masih aktif. Akibatnya, task masih bisa dibuat, diklaim, dikerjakan, disubmit, direview, atau ditukar (swap) meskipun project sudah berstatus `completed` atau `isArchived = true`. Perlindungan yang ada sebelumnya hanya bersifat kosmetik di frontend (menyembunyikan tombol "Tukar Task"), bukan pembatasan nyata di backend.

**Definisi project aktif:** Project dianggap aktif bila `isArchived === false` dan `status === "ongoing"`.

**File yang diubah:**
- `server/src/services/helper/auhtorization.helper.ts` — menambahkan fungsi baru `assertProjectIsActive(project)` yang melempar `ConflictError` (`409`) bila project sudah diarsipkan atau selesai. Fungsi ini menerima objek project yang sudah diambil sebelumnya (tidak melakukan query database sendiri) agar tidak terjadi query ganda.
- `server/src/services/task.service.ts` — menambahkan pemanggilan `assertProjectIsActive` pada `createTask`, `updateTask`, `claimTask`, `assignTask`, dan `doTask` (aksi mulai kerjakan), tepat setelah pemeriksaan keanggotaan/leader agar urutan pengecekan otorisasi tetap didahulukan (403 untuk yang bukan anggota, baru 409 untuk project tidak aktif).
- `server/src/services/submission.service.ts` — menambahkan pemeriksaan yang sama pada `createSubmission` (submit hasil kerja) dan `reviewSubmission` (review oleh leader).
- `server/src/services/task.swap.request.service.ts` — menambahkan pemeriksaan yang sama pada `createSwapTask` (mengajukan tukar tugas) dan `respondSwapRequest` (menyetujui/menolak tukar tugas). Aksi `cancelSwapRequest` **sengaja tidak** diberi pemeriksaan ini, agar pengguna tetap bisa membatalkan permintaan tukar tugas miliknya sendiri meskipun project baru saja diarsipkan.
- Endpoint yang sifatnya hanya membaca data (melihat daftar task, detail task, komentar, submission tertunda, daftar permintaan tukar tugas) **tidak** diberi pemeriksaan ini, sehingga riwayat project yang sudah diarsipkan tetap bisa dilihat.
- Penambahan komentar pada task **tidak** diblokir, karena diskusi terkait konteks historis project masih dianggap berguna.

**Test yang ditambahkan:**
- `server/src/tests/integration/task.test.ts` — blok `describe('Task actions on inactive projects', ...)` baru berisi kasus: penolakan pembuatan task pada project yang diarsipkan/selesai, penolakan klaim task setelah project diarsipkan, penolakan mulai-kerjakan pada project selesai (sekaligus memastikan pengguna bukan-anggota tetap mendapat `403` lebih dulu), dan tetap bisa melihat daftar/detail task pada project yang diarsipkan.
- `server/src/tests/integration/submission.test.ts` — test tambahan untuk penolakan submit dan penolakan review pada project yang sudah diarsipkan.
- `server/src/tests/integration/task.swap.request.test.ts` — test tambahan untuk penolakan pengajuan tukar tugas pada project yang sudah diarsipkan.

---

## Task 3 — Menegakkan aturan `isClaimable` / `assigneeId` saat pembuatan task

**Masalah:** Dokumentasi (`TASK_BOARD_BACKEND.md`) menyebutkan bahwa saat membuat task, jika `isClaimable = false` maka `assigneeId` wajib diisi dan status awal menjadi `todo`; jika `isClaimable = true` maka `assigneeId` tidak boleh diisi dan status awal menjadi `unclaimed`. Namun kode yang berjalan tidak memiliki field `assigneeId` sama sekali pada skema pembuatan task, sehingga leader tidak bisa langsung menugaskan task ke anggota tertentu saat pembuatan (satu-satunya cara adalah membuat task lalu memanggil endpoint assign terpisah).

**File yang diubah:**
- `server/src/schemas/task.schema.ts` — menambahkan field opsional `assigneeId` pada `createTaskSchema`, beserta dua aturan validasi (`.refine()`): `assigneeId` wajib diisi ketika `isClaimable = false`, dan `assigneeId` tidak boleh diisi ketika `isClaimable = true`.
- `server/src/services/task.service.ts` — pada `createTask`, menambahkan logika untuk menentukan status awal task (`todo` jika `isClaimable = false`, `unclaimed` jika sebaliknya) serta memvalidasi bahwa `assigneeId` yang diberikan benar-benar anggota aktif project (menggunakan `assertProjectMembership`, pola yang sama dengan endpoint assign yang sudah ada).
- `server/src/database/repositories/task.repository.ts` — memperluas tipe data parameter `createTask` agar turut menerima `assigneeId`, supaya nilai tersebut benar-benar tersimpan ke database.
- `server/src/docs/project.docs.ts` — memperbarui deskripsi endpoint pembuatan task (dokumentasi endpoint ini ternyata berada di file ini, bukan di `task.docs.ts`) untuk menjelaskan hubungan antara `isClaimable` dan `assigneeId`.

**Test yang ditambahkan** (`server/src/tests/integration/task.test.ts`, di dalam blok `POST /api/v1/projects/:id/tasks`):
- Pembuatan task pra-ditugaskan (status langsung `todo`) ketika `isClaimable = false` disertai `assigneeId` yang valid.
- Penolakan pembuatan task non-claimable tanpa `assigneeId`.
- Penolakan pembuatan task claimable yang tetap menyertakan `assigneeId`.
- Penolakan penugasan ke pengguna yang bukan anggota project.

Tidak ada perubahan pada frontend untuk task ini — fitur pra-penugasan saat pembuatan task murni kemampuan backend baru dan belum digunakan oleh form pembuatan task yang ada saat ini, sesuai batasan lingkup pada rencana kerja.

---

## Task 4 — Menolak deadline yang sudah lewat (validasi di sisi server)

**Masalah:** Validasi tanggal minimum untuk deadline hanya ada di sisi browser (atribut `min` pada input HTML), sehingga permintaan API langsung (atau permintaan yang dimodifikasi lewat dev tools) tetap bisa mengatur deadline di masa lalu.

**File yang diubah:**
- `server/src/schemas/task.schema.ts` — menambahkan validasi bersama `deadlineSchema` yang menolak tanggal deadline di masa lalu, dengan toleransi keterlambatan jam 60 detik untuk mengantisipasi selisih waktu jaringan antara klien dan server. Validasi ini dipasang pada `createTaskSchema` maupun `updateTaskSchema`.

**Test yang ditambahkan:**
- `server/src/tests/integration/task.test.ts` — penolakan deadline di masa lalu dan penerimaan deadline di masa depan saat pembuatan task, serta penolakan deadline di masa lalu saat pembaruan task.

**Pemeriksaan frontend:** Sudah diverifikasi bahwa `client/src/lib/validation/taskSchema.ts` (fungsi `validateTaskDeadline`) sudah memvalidasi deadline di masa lalu dengan pesan error berbahasa Indonesia yang sesuai gaya penulisan yang ada. Tidak diperlukan perubahan pada frontend.

---

## Task 5 — Validasi ulang status task saat permintaan tukar tugas disetujui

**Masalah:** Saat menyetujui permintaan tukar tugas (`respondSwapRequest`), sistem hanya memeriksa bahwa permintaan tukar masih berstatus `pending`, tanpa memeriksa ulang apakah task yang bersangkutan masih berada pada status yang bisa ditukar (`todo` atau `ongoing`). Jika ada jeda waktu antara pengajuan dan persetujuan tukar tugas, task bisa saja sudah berubah status (misalnya sudah disubmit atau direview) sehingga persetujuan tukar yang tetap diproses akan menghasilkan data yang tidak konsisten.

**File yang diubah:**
- `server/src/services/task.swap.request.service.ts` — pada `respondSwapRequest`, ditambahkan pemeriksaan ulang status task utama dan task target (jika ada) tepat sebelum transaksi tukar dijalankan. Jika salah satu task sudah tidak berada pada status `todo`/`ongoing`, permintaan tukar akan otomatis diberi status `rejected` (memakai nilai enum yang sudah ada, bukan nilai baru) dan permintaan ditolak dengan `409 CONFLICT`. Langkah otomatis-tolak ini dilakukan sebagai operasi tulis terpisah di luar transaksi utama, karena transaksi utama memang tidak pernah dimulai pada jalur kegagalan ini.

**Test yang ditambahkan:**
- `server/src/tests/integration/task.swap.request.test.ts` — skenario permintaan tukar tugas yang menjadi usang karena task sudah disubmit sebelum disetujui: persetujuan ditolak dengan `409 CONFLICT` dan status permintaan tukar di database otomatis berubah menjadi `rejected`.

---

## Task 6 — Frontend: menampilkan status "project tidak aktif" secara konsisten

**Latar belakang:** Setelah Task 2, backend akan menolak setiap aksi task pada project yang tidak aktif dengan `409`. Namun sebelum perubahan ini, tombol aksi (klaim/mulai/submit/review/tugaskan) di halaman detail task tidak mengetahui kondisi tersebut — pengguna baru akan melihat pesan error setelah mengklik tombol, alih-alih tombolnya memang disembunyikan sejak awal (berbeda dengan tombol "Tukar Task" yang sudah lebih dulu punya perilaku ini).

**File yang diubah:**
- `client/src/lib/api/tasks/taskStatus.ts` — fungsi `getAvailableActions` diberi parameter kedua opsional `projectIsActive` (default `true` agar seluruh pemanggil lama yang tidak mengirim parameter ini tetap berjalan seperti sebelumnya). Jika `false`, fungsi langsung mengembalikan daftar aksi kosong.
- `client/src/components/features/task-detail/TaskDetailActions.tsx` — menghitung status `isProjectActive` dari `project.status` dan `project.isArchived`, lalu menggunakannya untuk: (1) memfilter daftar aksi yang tersedia, (2) menambahkan syarat pada kemampuan menugaskan task (`canAssign`), dan (3) menampilkan catatan singkat berbahasa Indonesia ("Proyek ini sudah selesai atau diarsipkan...") sebagai pengganti panel aksi ketika project tidak aktif, alih-alih tidak menampilkan apa pun.

**Catatan pemeriksaan tambahan:** Sudah diverifikasi lewat pencarian kode bahwa `client/src/components/features/tasks/TaskBoardCard.tsx` adalah satu-satunya pemanggil lain dari `getAvailableActions`, namun komponen ini (beserta seluruh rantai pemanggilnya — `TaskBoardKanban.tsx` dan `TaskBoardColumn.tsx`) tidak menerima objek `project` sama sekali di dalam props-nya, sehingga tidak dapat diberi perbaikan yang sama tanpa mengubah alur pengiriman props pada banyak komponen sekaligus. Sesuai rencana kerja, pemanggil yang tidak memiliki informasi project ini dibiarkan menggunakan nilai default (`true`) dan tidak diubah, karena hal ini di luar cakupan minimal task ini. Perubahan pada `TaskBoardCard.tsx` dapat dijadikan pekerjaan lanjutan bila diperlukan. `TaskDetailHeader.tsx` juga sudah diperiksa dan dipastikan tidak menampilkan tombol aksi apa pun secara independen.

---

## Berkas yang TIDAK diubah meski sempat diperiksa

Sesuai instruksi rencana kerja, berkas-berkas berikut sengaja tidak diubah karena berada di luar cakupan:
- `server/src/services/helper/auhtorization.helper.ts` — nama file tetap memakai ejaan salah ("auhtorization") sesuai konvensi yang sudah ada di seluruh proyek.
- `server/TASK_BOARD_BACKEND.md` — dokumen perencanaan historis, tidak diedit atau dicentang meski ada butir yang belum tercentang; sebagian besar butir yang belum tercentang di sana sudah terlaksana pada kode yang berjalan saat ini, dan sisanya (swap, attachment, appeal) memang di luar cakupan rencana kerja ini.
- `server/scripts/run-tests.js` — sudah diperiksa dan seluruh file test yang disentuh (`task.test.ts`, `submission.test.ts`, `task.swap.request.test.ts`) memang sudah terdaftar, sehingga tidak perlu perubahan.

---

## Catatan verifikasi

- `npx tsc --noEmit` pada folder `server/` maupun `client/`: bersih, tidak ada error baru yang muncul akibat perubahan ini (hanya menyisakan satu error pre-existing yang tidak berkaitan, pada `server/src/vitest.config.ts`, yang sudah ada sebelum pengerjaan dimulai).
- `npm run lint` pada folder `client/`: tidak ada warning/error baru (hanya menyisakan satu warning pre-existing yang tidak berkaitan, pada `TaskDetailHeader.tsx`).
- **`npm run test` (backend) tidak dapat dijalankan** pada lingkungan pengerjaan ini karena tidak tersedia akses ke database PostgreSQL maupun Docker (percobaan instalasi PostgreSQL melalui package manager sistem juga gagal karena keterbatasan jaringan pada lingkungan ini). Seluruh perubahan kode dan test sudah ditelusuri secara manual terhadap alur route → middleware → service → repository yang sesungguhnya untuk memastikan konsistensi, namun test integrasi ini perlu dijalankan ulang dengan `npm run test` pada lingkungan yang memiliki database sebelum perubahan digabungkan (merge).
