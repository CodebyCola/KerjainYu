"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api/fetcher";
import { ApiRequestError } from "@/lib/api/apiRequestError";
import { Task } from "@/types/task";
import { TaskAction } from "@/lib/api/tasks/taskStatus";
import { projectRoutes } from "@/lib/routes";

export type TransitionTaskState = {
    success: boolean;
    error: string | null;
};

const ACTION_PATH: Record<TaskAction, string> = {
    claim: "claim",
    start: "start",
    submit: "submit",
    resume: "start",
    approve: "review",
    requestRevision: "review",
    reject: "review",
};

function buildBody(action: TaskAction): Record<string, string> | undefined {
    if (action === "approve") return { decision: "approved" };
    if (action === "requestRevision") return { decision: "in_revision" };
    if (action === "reject") return { decision: "rejected" };
    return undefined;
}

export async function transitionTaskAction(
    projectId: string,
    taskId: number,
    action: TaskAction,
): Promise<TransitionTaskState> {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();

        await apiFetch<Task>(`/task/${taskId}/${ACTION_PATH[action]}`, {
            method: "POST",
            body: buildBody(action),
            cookie: cookieHeader,
        });
    } catch (err) {
        if (err instanceof ApiRequestError) {
            return { success: false, error: err.message };
        }
        return {
            success: false,
            error: "Terjadi kesalahan tak terduga. Coba lagi.",
        };
    }

    revalidatePath(projectRoutes(projectId).TASK_BOARD);
    return { success: true, error: null };
}
