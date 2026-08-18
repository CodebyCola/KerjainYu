import { Router } from "express"
import { authenticate } from "../middlewares/auth.middlewares"
import * as commentTaskController from "../controllers/comment.task.controller"
import { validate } from "../middlewares/validate"
import { idParams } from "../schemas/id.schema"


const router = Router()

router.delete("/:id", authenticate, validate(idParams, 'params'), commentTaskController.deleteComment)

export default router;