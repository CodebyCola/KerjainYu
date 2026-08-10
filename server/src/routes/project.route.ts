import { Router } from "express";
import { authenticate } from "../middlewares/auth.middlewares";
import { createLimiter } from "../middlewares/rateLimiter";
import { validate } from "../middlewares/validate";
import * as projectSchema from "../schemas/projectSchema";
import * as projectController from "../controllers/project.controller";
const router = Router();

router.post(
  "/",
  authenticate,
  createLimiter,
  validate(projectSchema.createProjectWithLinksSchema),
  projectController.createProject,
);
router.patch("/:id", authenticate, createLimiter, validate(projectSchema.updateProjectSchema), projectController.updateProject)
router.get("/:id", authenticate, projectController.getDetailProject)
router.get("/", authenticate, projectController.getProjectsByUserId)

export default router;