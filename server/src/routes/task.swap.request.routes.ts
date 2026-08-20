import { Router } from "express";
import { authenticate } from "../middlewares/auth.middlewares";
import * as taskSwapRequestController from "../controllers/task.swap.request.controller"
import { validate } from "../middlewares/validate";
import { idParams } from "../schemas/id.schema";
import { respondSwapRequestSchema } from "../schemas/task.swap.request.schema";
const router = Router();


router.patch(
    "/:id/respond",
    authenticate,
    validate(idParams, "params"),
    validate(respondSwapRequestSchema, "body"),
    taskSwapRequestController.respondSwapRequest
)
router.patch(
    "/:id/cancel",
    authenticate,
    validate(idParams, "params"),
    taskSwapRequestController.cancelSwapRequest
)
export default router;