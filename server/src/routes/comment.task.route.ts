import { Router } from "express"
import { authenticate } from "../middlewares/auth.middlewares"
import * as commentTaskController from "../controllers/comment.task.controller"
import { validate } from "../middlewares/validate"
import { commentIdParams } from "../schemas/comment.task.schema"


const router = Router()

router.delete("/:id", authenticate, validate(commentIdParams, 'params'), commentTaskController.deleteComment)

export default router;