import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { AuthRequest } from "../middlewares/auth.middlewares";

export async function searchUserByUsername(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const username = String(req.query.username)
        const projectId = Number(req.query.excludeProjectId)
        // const userId = req.user!.id
        const users = await userService.searchUserByUsername(username, projectId)
        res.status(200).json({ success: true, data: users })
    } catch (error) {
        next(error)
    }
}
