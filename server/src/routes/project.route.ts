import { Router } from "express";
import { authenticate } from "../middlewares/auth.middlewares";
import { createLimiter } from "../middlewares/rateLimiter";
import { validate } from "../middlewares/validate";
import * as projectSchema from "../schemas/projectSchema";
import * as projectController from "../controllers/project.controller";
import * as taskSchema from "../schemas/task.schema";
const router = Router();

router.post(
  "/:id/tasks",
  authenticate,
  validate(taskSchema.createTaskSchema),
  projectController.createTask,
);
router.post(
  "/",
  authenticate,
  createLimiter,
  validate(projectSchema.createProjectWithLinksSchema),
  projectController.createProject,
);
router.get(
  "/:id/tasks",
  authenticate,
  validate(projectSchema.projectIdParams, "params"),
  projectController.getTasksByProject,
);
router.get(
  "/:id/members",
  authenticate,
  validate(projectSchema.projectIdParams, "params"),
  projectController.getMembersByProject,
);
router.patch(
  "/:id",
  authenticate,
  createLimiter,
  validate(projectSchema.updateProjectSchema),
  projectController.updateProject,
);
router.get("/:id", authenticate, projectController.getDetailProject);
router.get("/", authenticate, projectController.getProjectsByUserId);

export default router;
