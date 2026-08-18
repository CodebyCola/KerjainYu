import { Router } from "express";
import { authenticate } from "../middlewares/auth.middlewares";
import { createLimiter } from "../middlewares/rateLimiter";
import { validate } from "../middlewares/validate";
import * as projectSchema from "../schemas/projectSchema";
import { userIdParams } from "../schemas/userSchema"
import * as projectController from "../controllers/project.controller";
import * as projectMemberController from "../controllers/project.member.controller"
import * as taskSchema from "../schemas/task.schema";
import { updateProjectLinkSchema } from "../schemas/projectLinkSchema";
import * as projectLinkController from "../controllers/project.link.controller"
import { idParams } from "../schemas/id.schema";
const router = Router();


router.patch("/:id", authenticate, validate(idParams, 'params'), validate(updateProjectLinkSchema, "body"), projectLinkController.updateLink)
router.delete(
    "/:id",
    authenticate,
    validate(idParams, "params"),
    projectLinkController.deleteLink
);
export default router;