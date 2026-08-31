import { Router } from "express";
import { authenticate } from "../middlewares/auth.middlewares";
import { validate } from "../middlewares/validate";
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