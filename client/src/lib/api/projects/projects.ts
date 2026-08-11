import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { Project, CreateProjectPayload } from "@/types/project";
import { apiFetch } from "../fetcher";

const PROJECT_PATH = "/project";

export function getProjectsRequest(cookie: string) {
  return apiFetch<Project[]>(PROJECT_PATH, { cookie });
}

export function createProjectRequest(
  payload: CreateProjectPayload,
  cookie: string,
) {
  return apiFetch<Project>(PROJECT_PATH, {
    method: "POST",
    body: payload,
    cookie,
  });
}

export const getProjects = cache(async (): Promise<Project[]> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const { data } = await getProjectsRequest(cookieHeader);
    // GET /projects saat ini belum menyertakan members/links di response-nya
    // (lihat catatan di types/project.ts). Diisi default array kosong di sini
    // supaya komponen yang mengonsumsi Project (mis. ProjectListCard) tidak
    // perlu peduli soal field itu opsional atau tidak.
    return data.map((project) => ({
      ...project,
      members: project.members ?? [],
      links: project.links ?? [],
    }));
  } catch {
    return [];
  }
});
