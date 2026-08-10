import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middlewares";
import * as projectService from "../services/project.service";
import { UnauthorizedError } from "../errors/AppError";



//POST /api/v1/projects
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

//GET /api/v1/projects/:id
export async function getDetailProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = Number(req.params.id);
    const [project, membership, projectLinks] = await projectService.getDetailProject(projectId, req.user!.id)
    res.status(200).json({
      success: true,
      data: {
        project,
        membership,
        links: projectLinks,
      },
    })
  } catch (error) {
    next(error)
  }
}

//GET /api/v1/projects
export async function getProjectsByUserId(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projects = await projectService.getAllProjects(req.user!.id)
    res.status(200).json({ success: true, data: projects })
  } catch (error) {
    next(error)
  }
}
