"use server";

import { revalidatePath } from "next/cache";
import { updateProject } from "@/lib/api/projects/projects";
import { ROUTES } from "@/lib/routes";

export type UnarchiveProjectState = {
    success: boolean;
    error: string | null;
};

export async function unarchiveProjectAction(
    projectId: string,
): Promise<UnarchiveProjectState> {
    const result = await updateProject(projectId, { isArchived: false });

    if (!result.project) {
        return { success: false, error: result.error };
    }

    revalidatePath(ROUTES.ARCHIVE);
    revalidatePath(ROUTES.PROJECTS);
    return { success: true, error: null };
}
