import { Request, Response, NextFunction } from 'express'
import * as userService from "../services/user.service"
import { AuthRequest } from '../middlewares/auth.middlewares';

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await userService.registerUser(req.body);
        res.status(200).json({ success: true, data: user })
    } catch (error) {
        next(error)
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { user, token } = await userService.loginUser(req.body)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.status(200).json({ success: true, data: user })
    } catch (error) {
        next(error)
    }
}

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const user = await userService.getUserProfile(req.user!.id)
        res.status(200).json({ success: true, data: user })
    } catch (error) {
        next(error)
    }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        await userService.changeUserPassword(req.user!.id, req.body)
        res.status(200).json({ success: true, message: "Password changed successfully" })
    } catch (error) {
        next(error)
    }
}
export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const updated = await userService.updateUserProfile(req.user!.id, req.body);
        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
}
