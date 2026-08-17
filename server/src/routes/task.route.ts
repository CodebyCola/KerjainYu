import { Router } from "express";
import { authenticate } from "../middlewares/auth.middlewares";
import * as taskController from "../controllers/task.controller";
import { validate } from "../middlewares/validate";
import * as taskInput from "../schemas/task.schema";
import { taskIdParams } from "../docs/params/id.params";
const router = Router();


router.get("/:id", authenticate, validate(taskIdParams, "params"), taskController.getDetailTask)
router.patch("/:id/claim", authenticate, taskController.claimTask)
router.patch(
  "/:id",
  authenticate,
  validate(taskInput.updateTaskSchema),
  taskController.updateTask,
);
export default router;
router.get("/", authenticate, taskController.getMyTask);