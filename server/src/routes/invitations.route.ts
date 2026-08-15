import { Router } from "express"
import { authenticate } from "../middlewares/auth.middlewares"
import { validate } from "../middlewares/validate"
import { membershipIdParams, updateInvitationSchema } from "../schemas/invitation.schema"
import * as invitationController from "../controllers/invitation.controller"

const router = Router()

router.get("/", authenticate, invitationController.getMyInvitations)
router.patch("/:id", authenticate, validate(membershipIdParams, "params"), validate(updateInvitationSchema, "body"), invitationController.respondToInvitation)

export default router;