import { Router } from "express"
import { authenticate } from "../middlewares/auth.middlewares"
import { validate } from "../middlewares/validate"
import { updateInvitationSchema } from "../schemas/invitation.schema"
import * as invitationController from "../controllers/invitation.controller"
import { idParams } from "../schemas/id.schema"

import { readRateLimiter, writeRateLimiter } from "../middlewares/rateLimiter"
const router = Router();

router.get("/", readRateLimiter, authenticate, invitationController.getMyInvitations);

router.patch(
    "/:id",
    writeRateLimiter,
    authenticate,
    validate(idParams, "params"),
    validate(updateInvitationSchema, "body"),
    invitationController.respondToInvitation
);

export default router;