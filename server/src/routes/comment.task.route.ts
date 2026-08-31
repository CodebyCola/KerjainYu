import { Router } from "express"
import { authenticate } from "../middlewares/auth.middlewares"
import * as commentTaskController from "../controllers/comment.task.controller"
import { validate } from "../middlewares/validate"
import { idParams } from "../schemas/id.schema"
import { writeRateLimiter } from "../middlewares/rateLimiter"


const router = Router()
router.delete(
    "/:id",
    writeRateLimiter,
    authenticate,
    validate(idParams, "params"),
    commentTaskController.deleteComment
);
export default router;