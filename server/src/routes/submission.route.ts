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
    updateAttachmentSchema,
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
//DELETE /api/v1/submissions/:id/attachments/:attachmentId
router.delete(
    "/:id/attachments/:attachmentId",
    authenticate,
    validate(idParams, "params"),
    validate(attachmentIdParams, "params"),
    submissionController.deleteAttachment,
);
//PATCH /api/v1/submission/:id/attachments/:attachmentId
router.patch("/:id/attachments/:attachmentId", authenticate, validate(idParams, 'params'), validate(attachmentIdParams, 'params'), validate(updateAttachmentSchema, 'body'), submissionController.updateAttachment)
// PATCH /api/v1/submissions/:id/review
router.patch(
    "/:id/review",
    authenticate,
    validate(idParams, "params"),
    validate(reviewSubmissionSchema, "body"),
    submissionController.reviewSubmission,
);
// GET /api/v1/submissions/:id/attachments/:attachmentId/download-url
router.get(
    "/:id/attachments/:attachmentId/download-url",
    authenticate,
    validate(idParams, "params"),
    validate(attachmentIdParams, "params"),
    submissionController.createAttachmentDownloadUrl,
);
//GET /api/v1/submissions/:id/attachments
router.get("/:id/attachments", authenticate, validate(idParams, "params"), submissionController.getAttachmentsBySubmission)
export default router;