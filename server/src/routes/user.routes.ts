import { Router } from "express"
import { authenticate } from "../middlewares/auth.middlewares"
import { authLimiter } from "../middlewares/rateLimiter"
import * as userController from "../controllers/user.controller"
import { validate } from "../middlewares/validate"


const router = Router()

router.get("/search", authenticate, userController.searchUserByUsername)

export default router;