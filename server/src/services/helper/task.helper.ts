// helper/task.helper.ts
import { getTaskById } from "../../database/repositories/task.repository";
import { NotFoundError } from "../../errors/AppError";
import { assertProjectMembership } from "./auhtorization.helper";
export async function assertTaskAccess(taskId: number, userId: number) {
    const task = await getTaskById(taskId);
    if (!task) {
        throw new NotFoundError("Task not found");
    }
    await assertProjectMembership(task.projectId, userId);
    return task;
}