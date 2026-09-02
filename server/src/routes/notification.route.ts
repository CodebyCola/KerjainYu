import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth.middlewares";
import { idParams } from "../schemas/id.schema";
import { validate } from "../middlewares/validate";

const router = Router();


router.get("/stream", authenticate, notificationController.streamNotifications);
router.get("/me", authenticate, notificationController.getMyNotifications);
router.post("/:id/read", authenticate, validate(idParams, "params"), notificationController.markAsRead);
router.delete("/:id", authenticate, validate(idParams, "params"), notificationController.deleteNotificationById)
router.post("/read-all", authenticate, notificationController.markAsReadAll);

export default router;
