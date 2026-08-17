# Request ke tim server — halaman Team

Konteks: frontend halaman Team (`/projects/[projectId]/team`) sudah disambungkan
ke `GET /api/v1/projects/:id/members` (dummy data sudah dihapus). Saat menyambungkan,
ditemukan 3 gap antara kontrak yang dibutuhkan UI dan response endpoint saat ini.
Kolom yang dibutuhkan **sudah ada di `project_members`/`users`** (lihat `database.dbml`),
jadi ini murni perluasan query, bukan migration baru.

Sampai ini dikerjakan, frontend menampilkan fallback yang aman (bukan data palsu):
`fullName` → `null` (fallback ke `username`), `joinedAt` → `null` (baris "Bergabung ..."
disembunyikan), member `invited` tidak muncul sama sekali di list.

---

## 1. Sertakan `fullName` di response `GET /projects/:id/members`

**File**: `database/repositories/project.member.repository.ts` fungsi `getMembersByProject`

Query saat ini:
```ts
.select([
  "project_members.id",
  "project_members.project_id",
  "project_members.user_id",
  "project_members.role",
  "project_members.status",
  "users.username",
  "users.avatar_url",
]);
```

Tambahkan `"users.full_name"` ke `select`, lalu map ke `fullName` (camelCase) di response —
ikuti konvensi camelCase yang sudah dipakai field lain di endpoint ini.

## 2. Sertakan `joined_at` di response `GET /projects/:id/members`

Kolom `joined_at` sudah ada di tabel `project_members` (`database.dbml` baris 62), tapi
tidak ikut di-`select()`. Tambahkan `"project_members.joined_at"` ke query yang sama di atas,
map ke `joinedAt` (ISO string).

## 3. Sertakan member berstatus `invited` di response `GET /projects/:id/members`

Query saat ini punya filter `.where("project_members.status", "active")` yang membuang
member yang sedang pending undangan. Untuk halaman Team menampilkan badge "menunggu
konfirmasi" dan jumlah pending yang akurat, endpoint ini perlu **juga** mengembalikan
member berstatus `invited` (field `status` yang sudah ada di response akan membedakannya
di sisi client).

**Perlu dikonfirmasi ke produk**: apakah member `invited` boleh dilihat oleh *semua* member
project (siapapun yang buka halaman Team), atau cuma leader? Kalau perlu dibatasi, mungkin
lebih aman jadi query param opsional, misal `?includeInvited=true` yang cuma diizinkan kalau
requester adalah leader (`assertProjectLeader`), supaya default response tidak berubah untuk
consumer lain endpoint ini.

---

### Response `GET /projects/:id/members` yang diharapkan setelah perubahan di atas

```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "projectId": 4,
      "userId": 7,
      "role": "member",
      "status": "active",
      "username": "raka",
      "fullName": "Raka Pratama",
      "avatarUrl": null,
      "joinedAt": "2026-07-01T02:00:00.000Z"
    },
    {
      "id": 15,
      "projectId": 4,
      "userId": 9,
      "role": "member",
      "status": "invited",
      "username": "dewi.lestari",
      "fullName": "Dewi Lestari",
      "avatarUrl": null,
      "joinedAt": null
    }
  ]
}
```

Catatan: untuk row `invited`, `joinedAt` masuk akal `null` (belum benar-benar join) — silakan
konfirmasi ke produk kalau maksudnya beda (misal `joinedAt` = kapan diundang, bukan kapan
resmi jadi member aktif).

---

## Di luar scope dokumen ini (dicatat sebagai referensi)

- `GET /api/v1/projects/:id/invitations` — disebut sebagai kemungkinan endpoint di
  `database.dbml` (baris 86) tapi belum ada route/controller-nya. Tidak dibutuhkan oleh
  halaman Team versi ini (poin 3 di atas sudah cukup untuk kebutuhan saat ini), tapi
  dicatat kalau nanti ada fitur terpisah untuk melihat daftar undangan.
- Aksi kelola member lain yang UI-nya sudah ada tapi belum disambungkan ke server (di luar
  scope invite yang sudah selesai): promosi jadi leader dari halaman Team
  (`PATCH /projects/:id/leader` — endpoint ini **sudah ada**, tinggal disambungkan di
  frontend), dan keluarkan/batalkan undangan member (`DELETE .../members/:memberId` —
  endpoint ini **belum ada** di server).