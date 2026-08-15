import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { AuthRequest } from "../middlewares/auth.middlewares";

export async function searchUserByUsername(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const { username, excludeProjectId } = req.query as unknown as { username: string; excludeProjectId?: number };
        const users = await userService.searchUserByUsername(username, excludeProjectId)
        res.status(200).json({ success: true, data: users })
    } catch (error) {
        next(error)
    }
}
