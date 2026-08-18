import { Router } from "express";
import { authenticate } from "../middlewares/auth.middlewares";
import * as taskController from "../controllers/task.controller";
import { validate } from "../middlewares/validate";
import * as taskInput from "../schemas/task.schema";
import * as commentTaskController from "../controllers/comment.task.controller"
import { createCommentSchema } from "../schemas/comment.task.schema";
import { idParams } from "../schemas/id.schema";
const router = Router();

router.get("/:id/comments", authenticate, validate(idParams, 'params'), commentTaskController.getCommentsByTask)
router.post("/:id/comments", authenticate, validate(idParams, 'params'), validate(createCommentSchema, "body"), commentTaskController.createCommentToTask)
router.get("/:id", authenticate, validate(idParams, "params"), taskController.getDetailTask)
router.patch("/:id/claim", authenticate, validate(idParams, 'params'), taskController.claimTask)
router.patch("/:id/ongoing", authenticate, validate(idParams, 'params'), taskController.doTask)
router.patch(
  "/:id",
  authenticate,
  validate(taskInput.updateTaskSchema),
  taskController.updateTask,
);
router.get("/", authenticate, taskController.getMyTask);
export default router;