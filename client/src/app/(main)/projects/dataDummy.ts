import { Project } from "@/types/project";

export const dummyProjects: Project[] = [
  {
    id: -1,
    title: "Website Redesign",
    status: "ongoing",
    allowFreeSwap: true,
    deadline: "2026-09-01T00:00:00.000Z",
    isArchived: false,
    createdAt: "2026-08-01T08:30:00.000Z",
    members: [
      { id: -1, userId: -1, username: "raka", avatarUrl: null, role: "leader" },
      { id: -2, userId: -2, username: "dina", avatarUrl: null, role: "member" },
      {
        id: -3,
        userId: -3,
        username: "fajar",
        avatarUrl: null,
        role: "member",
      },
    ],
    links: [
      {
        id: -1,
        label: "Figma",
        url: "https://figma.com/file/abc",
        category: "design",
      },
      {
        id: -2,
        label: "Repo",
        url: "https://github.com/org/website",
        category: "development",
      },
    ],
  },
  {
    id: -2,
    title: "Mobile App - Onboarding Flow",
    status: "ongoing",
    allowFreeSwap: false,
    deadline: "2026-08-20T00:00:00.000Z",
    isArchived: false,
    createdAt: "2026-07-15T10:00:00.000Z",
    members: [
      {
        id: -4,
        userId: -4,
        username: "sinta",
        avatarUrl: null,
        role: "leader",
      },
      { id: -5, userId: -5, username: "budi", avatarUrl: null, role: "member" },
    ],
    links: [
      {
        id: -3,
        label: "Docs",
        url: "https://notion.so/onboarding-spec",
        category: "docs",
      },
    ],
  },
  {
    id: -3,
    title: "Internal Tools - Reporting Dashboard",
    status: "completed",
    allowFreeSwap: false,
    deadline: "2026-07-01T00:00:00.000Z",
    isArchived: false,
    createdAt: "2026-06-01T09:00:00.000Z",
    members: [
      {
        id: -6,
        userId: -6,
        username: "wulan",
        avatarUrl: null,
        role: "leader",
      },
      { id: -7, userId: -7, username: "raka", avatarUrl: null, role: "member" },
      { id: -8, userId: -8, username: "dina", avatarUrl: null, role: "member" },
      {
        id: -9,
        userId: -9,
        username: "fajar",
        avatarUrl: null,
        role: "member",
      },
    ],
    links: [],
  },
  {
    id: -4,
    title: "API Migration to v2",
    status: "ongoing",
    allowFreeSwap: true,
    deadline: "2026-08-15T00:00:00.000Z",
    isArchived: false,
    createdAt: "2026-08-05T14:20:00.000Z",
    members: [
      {
        id: -10,
        userId: -10,
        username: "fajar",
        avatarUrl: null,
        role: "leader",
      },
    ],
    links: [
      {
        id: -4,
        label: "Repo",
        url: "https://github.com/org/api-v2",
        category: "development",
      },
      {
        id: -5,
        label: "Swagger",
        url: "https://api.example.com/docs",
        category: "docs",
      },
    ],
  },
];

export function mergeWithDummy(realProjects: Project[]): Project[] {
  return [...realProjects, ...dummyProjects];
}
