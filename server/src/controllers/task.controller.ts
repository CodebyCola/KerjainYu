import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middlewares";
import * as taskService from "../services/task.service";

export async function getMyTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const tasks = await taskService.getTasksByUser(req.user!.id);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
}

//PATCH api/v1/tasks/:id
export async function updateTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const taskId = Number(req.params.id);
    const tasks = await taskService.updateTask(taskId, req.user!.id, req.body);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
}

//PATCH api/v1/tasks/:id/claim
export async function claimTask(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const taskId = Number(req.params.id)
    await taskService.claimTask(taskId, req.user!.id)
    res.status(200).json({ success: true, message: "Successfuly claimed task" })
  } catch (error) {
    next(error)
  }
}
