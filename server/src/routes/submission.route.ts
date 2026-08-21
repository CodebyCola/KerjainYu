// routes/submission.routes.ts

import { Router } from "express";
import * as submissionController from "../controllers/submission.controller";
import { authenticate } from "../middlewares/auth.middlewares";
import { validate } from "../middlewares/validate";

import { idParams } from "../schemas/id.schema";
import {
    createSubmissionSchema,
    reviewSubmissionSchema,
} from "../schemas/submission.schema";

const router = Router();



// PATCH /api/v1/submissions/:id/review
router.patch(
    "/:id/review",
    authenticate,
    validate(idParams, "params"),
    validate(reviewSubmissionSchema, "body"),
    submissionController.reviewSubmission,
);



export default router;