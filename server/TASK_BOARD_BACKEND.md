# Task Board — Kontrak Backend

Dokumen ini untuk tim server. Frontend Task Board (`/projects/[projectId]/task-board`) sudah dibangun mengasumsikan kontrak di bawah. Endpoint task **belum ada** sama sekali di server (belum ada `task.controller.ts`, `task.service.ts`, `task.route.ts`) — dokumen ini jadi spesifikasi untuk membangunnya, disesuaikan dengan `database.dbml` yang sudah ada.

> Semua field response pakai **camelCase** (ikuti konvensi `Project`/`ProjectMember` yang sudah ada), meskipun kolom DB snake_case.

---

## 1. Alur status (state machine)

Sesuai konfirmasi produk: perubahan status task **tidak bebas pindah kolom** — mengikuti alur linear dengan dua cabang di titik review. Ini penting karena validasi transisi harus dilakukan di **service layer**, bukan cuma trust dari body request.

```
unclaimed ──(klaim)──► todo ──► ongoing ──► submitted ──► approved   [akhir]
                                     ▲            │
                                     │            ├──► in_revision ──┘ (balik ongoing)
                                     │            │
                                     │            └──► rejected      [akhir, lihat catatan]
                                     │
                                     └── (revisi: in_revision → ongoing)
```

Tabel transisi valid yang disarankan (`from` → `to`, siapa yang boleh):

| From          | To            | Aktor                  | Aksi                                                                  |
| ------------- | ------------- | ---------------------- | --------------------------------------------------------------------- |
| `unclaimed`   | `todo`        | member manapun (klaim) | set `assignee_id` = diri sendiri, status → `todo`                     |
| `todo`        | `ongoing`     | assignee               | mulai kerja                                                           |
| `ongoing`     | `submitted`   | assignee               | submit hasil kerja (buat row di `task_submissions`, lihat §4 catatan) |
| `submitted`   | `approved`    | leader                 | approve                                                               |
| `submitted`   | `in_revision` | leader                 | minta revisi (isi `review_note`)                                      |
| `submitted`   | `rejected`    | leader                 | tolak                                                                 |
| `in_revision` | `ongoing`     | assignee               | lanjut kerja ulang                                                    |

**⚠️ Perlu dikonfirmasi ke tim produk:** apakah `rejected` benar-benar status akhir (task mati), atau assignee/leader bisa membuka lagi ke `ongoing`/`todo`? DBML tidak eksplisit soal ini. Untuk sementara backend disarankan **menolak semua transisi keluar dari `rejected`** (anggap final) sampai dikonfirmasi — lebih aman menyempitkan dulu daripada membuka celah state yang salah.

**Task tanpa pool (`is_claimable = false`)**: dibuat langsung dengan status awal `todo` dan `assignee_id` sudah diisi leader saat create — tidak pernah masuk status `unclaimed`.

---

## 2. Endpoint yang dibutuhkan

### `GET /api/v1/project/:projectId/tasks` -> DONEEEE

List semua task dalam satu project, dipakai oleh Task Board.

**Auth**: harus member project (cek `project_members`, status `active`).

**Response 200**:

```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "title": "Buat testing aplikasi",
      "description": "Buatin testing aplikasi untuk feature berikut ...",
      "status": "ongoing",
      "priority": 1,
      "displayOrder": 0,
      "projectId": 4,
      "deadline": "2026-09-20T00:00:00.000Z",
      "assigneeId": 7,
      "assignee": { "id": 7, "username": "raka", "avatarUrl": null },
      "createdBy": 3,
      "isClaimable": false,
      "createdAt": "2026-08-01T02:00:00.000Z",
      "updatedAt": null
    }
  ]
}
```

**Usulan improvement** (tolong konfirmasi): sertakan objek `assignee` ter-embed (bukan cuma `assigneeId`) supaya frontend tidak perlu request terpisah untuk render avatar/nama di card. Kalau tim server keberatan soal cost join, alternatifnya frontend fetch anggota project sekali (sudah ada di `Project.members`) lalu look-up manual by id — frontend sudah siap untuk kedua opsi, tinggal konfirmasi.

**⚠️ Gap terkait ditemukan saat review**: `GET /api/v1/project/:id` saat ini me-return `{ project, membership, links }`, di mana `membership` cuma `{ userId, role }` milik **user yang request**, bukan daftar semua anggota project. Artinya frontend saat ini **tidak punya cara mengambil daftar member + role suatu project** dari endpoint manapun (halaman Team juga kena dampak yang sama). Task board butuh ini untuk render avatar/nama assignee dan untuk tahu apakah user saat ini leader (menampilkan tombol create task / tombol review). Disarankan salah satu: > DONEEEE

- Tambahkan endpoint baru `GET /api/v1/project/:projectId/members` yang me-return array `ProjectMember[]` (id, userId, username, avatarUrl, role) — `project.member.repository.ts` sudah punya fungsi-fungsi terkait (`getProjects`, `getProjectByIdAndUser`) yang belum dipakai, kemungkinan bisa dikembangkan untuk ini.
- Atau, ubah `GET /api/v1/project/:id` supaya field `membership` diganti/ditambah jadi array semua member, bukan cuma milik requester.

Sebelum ada salah satu di atas, frontend Task Board untuk sementara render assignee secara minimal (tanpa nama/avatar penuh) — lihat catatan di komponen `TaskBoardCard`.

**Error**: `403 FORBIDDEN` kalau bukan member, `404 NOT_FOUND` kalau project tidak ada.

---

### `POST /api/v1/project/:projectId/tasks`

Buat task baru. **Leader only.**

**Body**:

```json
{
  "title": "Buat testing aplikasi",
  "description": "...",
  "priority": 1,
  "deadline": "2026-09-20T00:00:00.000Z",
  "isClaimable": true,
  "assigneeId": null
}
```

Validasi: kalau `isClaimable = false`, `assigneeId` wajib diisi dan status awal jadi `todo`. Kalau `isClaimable = true`, `assigneeId` harus `null`/kosong dan status awal `unclaimed`.

**Response 201**: objek `Task` (bentuk sama seperti item di §2 list).

---

### `PATCH /api/v1/task/:taskId`

Update field task (title/description/priority/deadline/displayOrder). **Leader only.** Endpoint ini **tidak dipakai untuk ubah status** — status punya endpoint sendiri (§3) karena butuh validasi transisi + efek samping (assignee, timestamp, dst) yang berbeda dari update field biasa.

**Body**: subset dari field di atas (semua optional, PATCH semantics).

**Response 200**: objek `Task` terbaru.

---

## 3. Endpoint transisi status (dipisah dari update biasa)

Alih-alih satu `PATCH` generik yang menerima `status` sembarangan, disarankan endpoint khusus per aksi supaya validasi transisi + otorisasi + efek samping jelas dan tidak bisa di-bypass dari client:

### `POST /api/v1/task/:taskId/claim`

Transisi `unclaimed → todo`. Aktor: member manapun (bukan cuma leader). Set `assignee_id` = user yang request. Tolak dengan `409 CONFLICT` kalau status task saat request bukan `unclaimed` (race condition dua orang klaim bersamaan).

### `POST /api/v1/task/:taskId/start`

Transisi `todo → ongoing`. Aktor: harus `assignee_id` == user yang request.

### `POST /api/v1/task/:taskId/submit`

Transisi `ongoing → submitted` **atau** `in_revision → ongoing` lalu langsung `→ submitted` (kalau alur revisi memang submit ulang tanpa balik ke ongoing dulu secara eksplisit — **perlu dikonfirmasi ke produk**, saat ini asumsi frontend: assignee klik "Kerjakan lagi" dulu untuk balik ke `ongoing`, baru submit). Aktor: `assignee_id` == user. Body opsional: catatan/lampiran submission (lihat §4 — di luar scope task board minimal, boleh nanti).

### `POST /api/v1/task/:taskId/review`

Transisi `submitted → approved | in_revision | rejected`. Aktor: leader. Body:

```json
{ "decision": "approved" | "in_revision" | "rejected", "reviewNote": "..." }
```

Semua endpoint di atas: **Response 200** dengan objek `Task` terbaru. Error `409 CONFLICT` kalau status task tidak sesuai prasyarat transisi (dicek ulang di service, jangan percaya asumsi status dari client — race condition antar user harus ditangani di level DB transaction/lock).

---

## 4. Yang sengaja di luar scope README ini

- **Swap request** (`task_swap_requests`) — task board versi ini belum menyediakan UI untuk swap, jadi endpoint terkait belum dibutuhkan sekarang. Akan menyusul kalau fitur swap mulai dikerjakan.
- **Submission attachment** (`submission_attachments`) — endpoint `/submit` di atas untuk sekarang cukup pindah status saja; body catatan/lampiran opsional dan boleh diimplementasikan bertahap, tidak menghalangi board berfungsi.
- **Appeal** (`task_appeals`) — sama, di luar scope minimal board.

---

## 5. Checklist implementasi backend

- [ ] `task.repository.ts` — perbaiki bug `createTask` yang tidak `return` hasil insert (lihat catatan review sebelumnya).
- [ ] `task.schema.ts` — tambahkan `projectId`, `assigneeId`, `createdBy`, `isClaimable` ke schema kalau belum ada di validasi create/update.
- [ ] `task.service.ts` — implementasi validasi state machine di §1 (satu fungsi `assertValidTransition(from, to)` yang reusable dipanggil dari tiap endpoint transisi).
- [ ] `task.controller.ts` + `task.route.ts` — daftarkan semua endpoint di §2 dan §3.
- [ DONE ] Pastikan `GET /project/:projectId/tasks` cek membership dulu sebelum query (pola sama seperti `project.service.ts` yang sudah ada untuk `getProjectByIdAndUser`).
- [ ] Tambahkan ke `app.ts` dan `src/docs/registry.ts` (Swagger).
- [ ] Test integrasi minimal: create → claim → start → submit → review (approve & in_revision), termasuk kasus transisi invalid harus ditolak `409`.

Migration `tasks` juga masih ada 2 bug yang perlu dibenahi lebih dulu (lihat TODO umum project): `display_order` ada `()` ekstra yang bikin migration gagal, dan `priority` seharusnya nullable bukan `notNullable()`.
