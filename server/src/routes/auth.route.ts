import { Router } from "express"
import { authenticate } from "../middlewares/auth.middlewares"
import { authRateLimiter, readRateLimiter, writeRateLimiter } from "../middlewares/rateLimiter"
import * as authController from "../controllers/auth.controller"
import { changePasswordSchema, loginSchema, registerSchema, updateUserSchema } from "../schemas/userSchema"
import { validate } from "../middlewares/validate"


const router = Router()

// === TESTING / UTILITY (Paling Atas) ===
router.get("/test-limit", authRateLimiter, (req, res) => {
    res.json({ success: true, message: "OK" });
});

// === STRICT AUTH / PUBLIC ROUTES ===
router.post("/register", authRateLimiter, validate(registerSchema), authController.register);
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/logout", authRateLimiter, authController.logout);
router.post("/refresh", authRateLimiter, authController.refresh);

// === PROFILE / AUTHENTICATED ROUTES (Statis) ===
router.get("/me", readRateLimiter, authenticate, authController.getProfile);
router.patch("/me", writeRateLimiter, authenticate, validate(updateUserSchema), authController.updateProfile);
router.patch(
    "/me/change-password",
    authRateLimiter,
    authenticate,
    validate(changePasswordSchema),
    authController.changePassword
);
export default router;