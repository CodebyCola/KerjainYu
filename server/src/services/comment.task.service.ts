import * as commentTaskRepo from "../database/repositories/comment.task.repository"
import * as taskRepo from "../database/repositories/task.repository"
import { NotFoundError } from "../errors/AppError";
import { assertProjectMembership } from "./helper/auhtorization.helper"
import { assertTaskAccess } from "./helper/task.helper";

//GET /api/v1/tasks/:id/comments
export async function getCommentsTask(taskId: number, userId: number) {
    await assertTaskAccess(taskId, userId)
    return commentTaskRepo.getCommentsByTask(taskId);
}

//POST /api/v1/tasks/:id/comments
export async function createCommentTask(taskId: number, userId: number, comment: string) {
    await assertTaskAccess(taskId, userId)
    const [commentTask] = await commentTaskRepo.createComment(taskId, userId, comment)
    return commentTask
}