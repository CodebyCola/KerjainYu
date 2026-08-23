// routes/submission.routes.ts

import { Router } from "express";
import * as submissionController from "../controllers/submission.controller";
import { authenticate } from "../middlewares/auth.middlewares";
import { validate } from "../middlewares/validate";

import { idParams } from "../schemas/id.schema";
import {
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
    validate(createFileAttachmentSchema, "body"),
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


export default router;