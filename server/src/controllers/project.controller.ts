import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middlewares";
import * as projectService from "../services/project.service";
import * as taskService from "../services/task.service";
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

//POST /api/v1/projects/:id/tasks
export async function createTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = Number(req.params.id);
    const task = await taskService.createTask(
      projectId,
      req.user!.id,
      req.body,
    );
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

//GET /api/v1/projects/:id
export async function getDetailProject(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = Number(req.params.id);
    const [project, membership, projectLinks] =
      await projectService.getDetailProject(projectId, req.user!.id);
    res.status(200).json({
      success: true,
      data: {
        project,
        membership,
        links: projectLinks,
      },
    });
  } catch (error) {
    next(error);
  }
}

//GET /api/v1/projects
export async function getProjectsByUserId(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projects = await projectService.getAllProjects(req.user!.id);
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
}

//GET /api/v1/projects/{id}/tasks
export async function getTasksByProject(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = Number(req.params.id);
    const tasks = await projectService.getTasksByProject(
      projectId,
      req.user!.id,
    );
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
}

//PATCH /api/v1/projects/{id}
export async function updateProject(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = Number(req.params.id);
    const project = await projectService.updateProject(
      projectId,
      req.user!.id,
      req.body,
    );
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
}
//POST /api/v1/project/{id}/invitations
export async function inviteMember(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = Number(req.params.id);
    const userId = Number(req.body.userId);
    await projectService.inviteMember(projectId, req.user!.id, userId)
    res.status(200).json({ success: true, message: "Successfuly invited user to project" })
  } catch (error) {
    next(error)
  }
}

//DELETE /api/v1/projects/:id
export async function deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = Number(req.params.id);
    await projectService.deleteProject(projectId, req.user!.id)
    res.status(200).json({ success: true, message: "Successfuly deleted project" })
  } catch (error) {
    next(error)
  }
}