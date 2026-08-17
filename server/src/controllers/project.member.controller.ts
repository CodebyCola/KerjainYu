import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middlewares";
import * as projectMemberService from "../services/project.member.service";
//GET /api/v1/projects/{id}/members
export async function getMembersByProject(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const projectId = Number(req.params.id);
        const members = await projectMemberService.getMembersByProject(
            projectId,
            req.user!.id,
        );
        res.status(200).json({ success: true, data: members });
    } catch (error) {
        next(error);
    }
}

//PATCH /api/v1/projects/:id/leader
export async function promoteToLeader(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const projectId = Number(req.params.id)
        const prospectiveMemberId = Number(req.body.userId)
        const newLeader = await projectMemberService.promoteToLeader(projectId, req.user!.id, prospectiveMemberId)
        res.status(200).json({ success: true, message: "Successfuly promote leader", data: newLeader })
    } catch (error) {
        next(error)
    }
}