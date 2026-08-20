import "server-only";
import { cookies } from "next/headers";
import { ProjectLink, CreateProjectLinkPayload } from "@/types/project";
import { apiFetch } from "../fetcher";
import { ApiRequestError } from "../apiRequestError";

function projectLinksPath(projectId: string) {
  return `/projects/${projectId}/links`;
}

function linkPath(linkId: number) {
  return `/links/${linkId}`;
}

export function createProjectLinkRequest(
  projectId: string,
  payload: CreateProjectLinkPayload,
  cookie: string,
) {
  return apiFetch<ProjectLink>(projectLinksPath(projectId), {
    method: "POST",
    body: payload,
    cookie,
  });
}

export function deleteProjectLinkRequest(linkId: number, cookie: string) {
  return apiFetch<null>(linkPath(linkId), {
    method: "DELETE",
    cookie,
  });
}

export async function createProjectLink(
  projectId: string,
  payload: CreateProjectLinkPayload,
): Promise<{ link: ProjectLink | null; error: string | null }> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const { data } = await createProjectLinkRequest(projectId, payload, cookieHeader);
    return { link: data, error: null };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { link: null, error: err.message };
    }
    return { link: null, error: "Terjadi kesalahan tak terduga. Coba lagi." };
  }
}

export async function deleteProjectLink(
  linkId: number,
): Promise<{ success: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    await deleteProjectLinkRequest(linkId, cookieHeader);
    return { success: true, error: null };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Terjadi kesalahan tak terduga. Coba lagi." };
  }
}