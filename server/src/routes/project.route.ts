import { Router } from "express";
import { authenticate } from "../middlewares/auth.middlewares";
import { createLimiter } from "../middlewares/rateLimiter";
import { validate } from "../middlewares/validate";
import * as projectSchema from "../schemas/projectSchema";
import { userIdParams } from "../schemas/userSchema"
import * as projectController from "../controllers/project.controller";
import * as submissionController from "../controllers/submission.controller";
import * as projectMemberController from "../controllers/project.member.controller"
import * as taskSchema from "../schemas/task.schema";
import { createProjectLinkSchema, updateProjectLinkSchema } from "../schemas/projectLinkSchema";
import * as projectLinkController from "../controllers/project.link.controller"
import { idParams } from "../schemas/id.schema";
import { removeMemberParams } from "../schemas/project.member.schema";
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
router.post("/:id/links", authenticate, validate(idParams, "params"), validate(createProjectLinkSchema, "body"), projectLinkController.createLink)
router.post("/:id/invitations", authenticate, validate(idParams, "params"), validate(userIdParams, "body"), projectController.inviteMember)
router.get(
  "/:id/tasks",
  authenticate,
  validate(idParams, "params"),
  projectController.getTasksByProject,
);
router.get(
  "/:id/pending-submissions",
  authenticate,
  validate(idParams, "params"),
  submissionController.pendingSubmissionsByProject,
);
router.delete("/:id/members/:userId", authenticate, validate(removeMemberParams, "params"), projectMemberController.removeMember)
router.post("/:id/leave", authenticate, validate(idParams, 'params'), projectMemberController.leaveProject)
router.get(
  "/:id/members",
  authenticate,
  validate(idParams, "params"),
  projectMemberController.getMembersByProject,
);
router.patch("/:id/leader", authenticate, createLimiter, validate(userIdParams, "body"), projectMemberController.promoteToLeader)
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
