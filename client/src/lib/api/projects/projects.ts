import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { Project, CreateProjectPayload } from "@/types/project";
import { apiFetch } from "../fetcher";

const PROJECT_PATH = "/project";

// Request Url
export function getProjectsRequest(cookie: string) {
  return apiFetch<Project[]>(PROJECT_PATH, { cookie });
}

export async function getProjectRequest(projectId: number, cookie: string) {
  return apiFetch(`${PROJECT_PATH}/${projectId}`, { cookie });
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

// Fetcher
export const getProjects = cache(async (): Promise<Project[]> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const { data } = await getProjectsRequest(cookieHeader);
    return data.map((project) => ({
      ...project,
      members: project.members ?? [],
    }));
  } catch {
    return [];
  }
});

export const getProject = cache(async (projectId: number) => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  try {
    const { data } = await getProjectRequest(projectId, cookieHeader);

    return data;
  } catch {
    return null;
  }
});
