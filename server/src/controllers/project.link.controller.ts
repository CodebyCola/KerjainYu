import { NextFunction, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middlewares";
import * as projectLinkService from "../services/project.link.service";


//POST /api/v1/projects/:id/links
export async function createLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const projectId = Number(req.params.id)
        const link = await projectLinkService.createProjectLink(projectId, req.user!.id, req.body)
        res.status(201).json({ success: true, message: "Successfuly added link to project", data: link })
    } catch (error) {
        next(error)
    }
}

//PATCH /api/v1/links/:id
export async function updateLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const linkId = Number(req.params.id)
        await projectLinkService.updateProjectLink(linkId, req.user!.id, req.body)
        res.status(200).json({ success: true, message: "Successfuly update link" })
    } catch (error) {
        next(error)
    }
}

// DELETE /api/v1/links/:id
export async function deleteLink(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const linkId = Number(req.params.id);

        await projectLinkService.deleteProjectLink(
            linkId,
            req.user!.id
        );

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}