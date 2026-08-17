import { Request, Response, NextFunction } from "express";
import * as invitationService from "../services/invitation.service"
import { AuthRequest } from "../middlewares/auth.middlewares";

export async function getMyInvitations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const invitations = await invitationService.getAllInvitations(req.user!.id)
        res.status(200).json({ success: true, data: invitations })
    } catch (error) {
        next(error)
    }
}

export async function respondToInvitation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const membershipId = Number(req.params.id)
        const response = req.body.status
        await invitationService.respondToInvitation(membershipId, req.user!.id, response)
        res.status(200).json({ success: true, message: "Successfuly respond to invitation" })
    } catch (error) {
        next(error)
    }
}