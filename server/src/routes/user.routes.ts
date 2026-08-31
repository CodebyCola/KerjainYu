import { Router } from "express"
import { authenticate } from "../middlewares/auth.middlewares"
import { authRateLimiter } from "../middlewares/rateLimiter"
import * as userController from "../controllers/user.controller"
import { validate } from "../middlewares/validate"
import { searchUserQuerySchema } from "../schemas/userSchema"

import { readRateLimiter } from "../middlewares/rateLimiter"
const router = Router();

router.get(
    "/search",
    readRateLimiter,
    authenticate,
    validate(searchUserQuerySchema, "query"),
    userController.searchUserByUsername
);

export default router;