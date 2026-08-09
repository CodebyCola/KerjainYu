import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middlewares";
import * as projectService from "../services/project.service";
import { UnauthorizedError } from "../errors/AppError";

export async function createProject(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { project, links } = req.body;
    const createdBy = req.user!.id;

    const result = await projectService.createProjectWithLinks(
      project,
      links,
      createdBy,
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
