import { Router } from "express";
import { authenticate } from "../middlewares/auth.middlewares";
import * as taskController from "../controllers/task.controller";
import { validate } from "../middlewares/validate";
import * as taskInput from "../schemas/task.schema";
import * as commentTaskController from "../controllers/comment.task.controller"
import { createCommentSchema } from "../schemas/comment.task.schema";

import * as submissionController from "../controllers/submission.controller";
import { createRequest } from "../controllers/task.swap.request.controller";
import { idParams } from "../schemas/id.schema";
import { userIdParams } from "../schemas/userSchema";
import { createSwapRequestSchema } from "../schemas/task.swap.request.schema";
import { createSubmissionSchema } from "../schemas/submission.schema";
import { createSubmission } from "../services/submission.service";
const router = Router();

router.get("/:id/comments", authenticate, validate(idParams, 'params'), commentTaskController.getCommentsByTask)
router.post(
  "/:id/submissions",
  authenticate,
  validate(idParams, "params"),
  validate(createSubmissionSchema, "body"),
  submissionController.createSubmission,
);
router.post("/:id/comments", authenticate, validate(idParams, 'params'), validate(createCommentSchema, "body"), commentTaskController.createCommentToTask)
router.post("/:id/swap-requests", authenticate, validate(idParams, 'params'), validate(createSwapRequestSchema, "body"), createRequest)
router.get("/:id", authenticate, validate(idParams, "params"), taskController.getDetailTask)
router.patch("/:id/claim", authenticate, validate(idParams, 'params'), taskController.claimTask)
router.patch("/:id/assign", authenticate, validate(idParams, 'params'), validate(userIdParams, 'body'), taskController.assignTask)
router.patch("/:id/ongoing", authenticate, validate(idParams, 'params'), taskController.doTask)
router.patch(
  "/:id",
  authenticate,
  validate(taskInput.updateTaskSchema),
  taskController.updateTask,
);
router.get("/", authenticate, taskController.getMyTask);
export default router;