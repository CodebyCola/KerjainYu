import * as commentTaskRepo from "../database/repositories/comment.task.repository"
import * as projectMemberRepo from "../database/repositories/project.member.repository"
import { ForbiddenError, NotFoundError } from "../errors/AppError";
import { assertTaskAccess } from "./helper/task.helper";
import { db } from "../database/db";
import { notifyUser } from "./notification.service";

//GET /api/v1/tasks/:id/comments
export async function getCommentsTask(taskId: number, userId: number) {
    await assertTaskAccess(taskId, userId)
    return commentTaskRepo.getCommentsByTask(taskId);
}

//POST /api/v1/tasks/:id/comments
export async function createCommentTask(taskId: number, userId: number, comment: string) {
    const task = await assertTaskAccess(taskId, userId)

    return db.transaction(async (trx) => {
        const [commentTask] = await commentTaskRepo.createComment(taskId, userId, comment, trx)

        let targetUserId: number | null = null;
        if (task.assigneeId === userId) {
            const leader = await projectMemberRepo.getProjectLeader(task.projectId);
            targetUserId = leader?.userId ?? null;
        } else if (task.assigneeId) {
            targetUserId = task.assigneeId;
        }

        if (targetUserId && targetUserId !== userId) {
            await notifyUser({
                userId: targetUserId,
                type: "comment_added",
                referenceType: "task",
                referenceId: taskId,
                message: `New comment on task "${task.title}"`,
            }, trx);
        }

        return commentTask
    })
}

//DELETE /api/v1/comments/:id
export async function deleteComment(commentId: number, userId: number) {
    const comment = await commentTaskRepo.getCommentById(commentId)
    if (!comment) {
        throw new NotFoundError("Comment no longer exists")
    }
    if (userId !== comment.userId) {
        throw new ForbiddenError("You have no right to delete this comment")
    }
    return await commentTaskRepo.deleteComment(commentId)
}