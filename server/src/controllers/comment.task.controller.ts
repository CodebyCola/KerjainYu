import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middlewares";
import * as commentTaskService from "../services/comment.task.service"

//GET /api/v1/tasks/:id/comments
export async function getCommentsByTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const taskId = Number(req.params.id)
        const comments = await commentTaskService.getCommentsTask(taskId, req.user!.id)
        res.status(200).json({ success: true, data: comments })
    } catch (error) {
        next(error)
    }
}

//POST /api/v1/tasks/:id/comments
export async function createCommentToTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const taskId = Number(req.params.id)
        const descriptionComment = req.body.comment
        const comment = await commentTaskService.createCommentTask(taskId, req.user!.id, descriptionComment)
        res.status(201).json({ success: true, message: "Successfuly add comment to task", data: comment })
    } catch (error) {
        next(error)
    }
}

//DELETE /api/v1/comments/:id
export async function deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id)
        await commentTaskService.deleteComment(id, req.user!.id)
        res.status(200).json({ success: true, message: "Successfully deleted comment" })
    } catch (error) {
        next(error)
    }
}