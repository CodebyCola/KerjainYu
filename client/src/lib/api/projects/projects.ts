import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { Project, CreateProjectPayload } from "@/types/project";
import { apiFetch } from "../fetcher";

export function getProjectsRequest(cookie: string) {
  return apiFetch<Project[]>("/projects", { cookie });
}

export function createProjectRequest(payload: CreateProjectPayload, cookie: string) {
  return apiFetch<Project>("/projects", { method: "POST", body: payload, cookie });
}

export const getProjects = cache(async (): Promise<Project[]> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const { data } = await getProjectsRequest(cookieHeader);
    return data;
  } catch {
    return [];
  }
});