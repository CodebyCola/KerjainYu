import { TeamMember, UserSearchResult } from "@/types/team";

// DUMMY DATA — ganti dengan fetch ke server begitu endpoint di
// server/src/routes/member.route.ts sudah ada. Lihat README di root
// deliverable ini untuk kontrak response yang diharapkan.
export const DUMMY_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    userId: 101,
    username: "raka.pratama",
    fullName: "Raka Pratama",
    avatarUrl: null,
    role: "leader",
    status: "active",
    joinedAt: "2026-07-01T02:00:00.000Z",
  },
  {
    id: 2,
    userId: 102,
    username: "siti.aisyah",
    fullName: "Siti Aisyah",
    avatarUrl: null,
    role: "member",
    status: "active",
    joinedAt: "2026-07-02T05:30:00.000Z",
  },
  {
    id: 3,
    userId: 103,
    username: "budi.santoso",
    fullName: "Budi Santoso",
    avatarUrl: null,
    role: "member",
    status: "active",
    joinedAt: "2026-07-04T09:15:00.000Z",
  },
  {
    id: 4,
    userId: 104,
    username: "dewi.lestari",
    fullName: "Dewi Lestari",
    avatarUrl: null,
    role: "member",
    status: "invited",
    joinedAt: "2026-08-10T11:00:00.000Z",
  },
];

// DUMMY DATA — hasil pencarian user buat modal invite. Ganti dengan fetch ke
// GET /api/v1/users/search?q= begitu tersedia (lihat README).
export const DUMMY_SEARCHABLE_USERS: UserSearchResult[] = [
  { id: 105, username: "farhan.ali", fullName: "Farhan Ali", avatarUrl: null },
  {
    id: 106,
    username: "nadia.putri",
    fullName: "Nadia Putri",
    avatarUrl: null,
  },
  { id: 107, username: "eko.wijaya", fullName: "Eko Wijaya", avatarUrl: null },
  { id: 108, username: "citra.ayu", fullName: "Citra Ayu", avatarUrl: null },
];
