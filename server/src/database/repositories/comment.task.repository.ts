import { db } from "../db";

export async function getCommentById(id: number) {
    return db("comments_task")
        .where({ id })
        .whereNull('deleted_at')
        .first()
        .select([
            "id",
            "task_id",
            "user_id",
            "comment",
        ]);
}
export async function createComment(taskId: number, userId: number, comment: string) {
    return db("comments_task").insert({ task_id: taskId, user_id: userId, comment: comment }).returning("*")
}
export async function deleteComment(id: number) {
    return db("comments_task")
        .where({
            id,
        })
        .whereNull("deleted_at")
        .update({
            deleted_at: db.fn.now(),
        });
}
export async function getCommentsByTask(taskId: number) {
    return db("comments_task")
        .where({ taskId })
        .join('users', 'users.id', 'comments_task.user_id')
        .orderBy('comments_task.created_at', 'asc')
        .select(
            "comments_task.id",
            "comments_task.comment",
            "comments_task.created_at",
            "users.id as user_id",
            "users.username",
            "users.avatar_url"
        );
}