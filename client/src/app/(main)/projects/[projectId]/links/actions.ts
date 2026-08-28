"use server";

import { revalidatePath } from "next/cache";
import { createProjectLink, deleteProjectLink } from "@/lib/api/links/links";
import { ProjectLink, CreateProjectLinkPayload } from "@/types/project";
import { projectRoutes } from "@/lib/routes";

export type AddLinkState = {
    link: ProjectLink | null;
    error: string | null;
};

export async function addLinkAction(
    projectId: string,
    payload: CreateProjectLinkPayload,
): Promise<AddLinkState> {
    const result = await createProjectLink(projectId, payload);
    if (result.link) {
        revalidatePath(projectRoutes(projectId).LINKS);
    }
    return result;
}

export type DeleteLinkState = {
    success: boolean;
    error: string | null;
};

export async function deleteLinkAction(
    projectId: string,
    linkId: number,
): Promise<DeleteLinkState> {
    const result = await deleteProjectLink(linkId);
    if (result.success) {
        revalidatePath(projectRoutes(projectId).LINKS);
    }
    return result;
}