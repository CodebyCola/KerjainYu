// routes/submission.routes.ts

import { Router } from "express";
import * as submissionController from "../controllers/submission.controller";
import { authenticate } from "../middlewares/auth.middlewares";
import { validate } from "../middlewares/validate";

import { idParams } from "../schemas/id.schema";
import {
    attachmentIdParams,
    createAttachmentSchema,
    createFileAttachmentSchema,
    createFileUploadUrlSchema,
    reviewSubmissionSchema,
} from "../schemas/submission.schema";

const router = Router();


// POST /api/v1/submissions/:id/attachments/upload-url
router.post(
    "/:id/attachments/upload-url",
    authenticate,
    validate(idParams, "params"),
    validate(createFileUploadUrlSchema, "body"),
    submissionController.createAttachmentUploadUrl,
);
// POST /api/v1/submissions/:id/attachments
router.post(
    "/:id/attachments",
    authenticate,
    validate(idParams, "params"),
    validate(createAttachmentSchema, "body"),
    submissionController.createFileAttachment,
);

// PATCH /api/v1/submissions/:id/review
router.patch(
    "/:id/review",
    authenticate,
    validate(idParams, "params"),
    validate(reviewSubmissionSchema, "body"),
    submissionController.reviewSubmission,
);

//GET /api/v1/submissions/:id/attachments
router.get("/:id/attachments", authenticate, validate(idParams, "params"), submissionController.getAttachmentsBySubmission)
router.delete(
    "/:id/attachments/:attachmentId",
    authenticate,
    validate(idParams, "params"),
    validate(attachmentIdParams, "params"),
    submissionController.deleteAttachment,
);
export default router;