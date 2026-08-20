import { Router } from "express"
import { authenticate } from "../middlewares/auth.middlewares"
import { authLimiter } from "../middlewares/rateLimiter"
import * as authController from "../controllers/auth.controller"
import { changePasswordSchema, loginSchema, registerSchema, updateUserSchema } from "../schemas/userSchema"
import { validate } from "../middlewares/validate"


const router = Router()

router.post("/register", authLimiter, validate(registerSchema), authController.register)
router.post("/login", authLimiter, validate(loginSchema), authController.login)
router.post("/logout", authController.logout)
router.post("/refresh", authController.refresh)
router.get("/me", authenticate, authController.getProfile)
router.patch("/me", authenticate, validate(updateUserSchema), authController.updateProfile)
router.patch("/me/change-password", authLimiter, authenticate, validate(changePasswordSchema), authController.changePassword)

export default router;