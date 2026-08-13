import { Router } from "express";
import { authenticate } from "../middlewares/auth.middlewares";
import * as taskController from "../controllers/task.controller";
import { validate } from "../middlewares/validate";
import * as taskInput from "../schemas/task.schema";
const router = Router();

router.get("/", authenticate, taskController.getMyTask);
router.patch(
  "/:id",
  authenticate,
  validate(taskInput.updateTaskSchema),
  taskController.updateTask,
);
export default router;