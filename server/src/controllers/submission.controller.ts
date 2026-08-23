import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middlewares";
import * as submissionService from "../services/submission.service";

// POST /api/v1/tasks/:id/submissions
export async function createSubmission(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const taskId = Number(req.params.id);

        const submission = await submissionService.createSubmission(
            taskId,
            req.user!.id,
            req.body,
        );

        res.status(201).json({
            success: true,
            data: submission,
        });
    } catch (error) {
        next(error);
    }
}

// POST /api/v1/submissions/:id/attachments/upload-url
export async function createAttachmentUploadUrl(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const submissionId = Number(req.params.id);

        const result =
            await submissionService.createAttachmentUploadUrl(
                submissionId,
                req.user!.id,
                req.body,
            );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// POST /api/v1/submissions/:id/attachments
export async function createFileAttachment(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const submissionId = Number(req.params.id);

        const { contentAttachment, fileAttachment } =
            await submissionService.createAttachment(
                submissionId,
                req.user!.id,
                req.body,
            );

        res.status(201).json({
            success: true,
            data: { contentAttachment, fileAttachment }
        });
    } catch (error) {
        next(error);
    }
}

// PATCH /api/v1/submissions/:id/review
export async function reviewSubmission(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const submissionId = Number(req.params.id);

        const submission =
            await submissionService.reviewSubmission(
                submissionId,
                req.user!.id,
                req.body,
            );

        res.status(200).json({
            success: true,
            data: submission,
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/v1/projects/:id/pending-submissions
export async function pendingSubmissionsByProject(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const projectId = Number(req.params.id);

        const submissions =
            await submissionService.pendingSubmissionsByProject(
                projectId,
                req.user!.id,
            );

        res.status(200).json({
            success: true,
            data: submissions,
        });
    } catch (error) {
        next(error);
    }
}

//GET /api/v1/submissions/:id/attachments
export async function getAttachmentsBySubmission(req: AuthRequest,
    res: Response,
    next: NextFunction) {
    try {
        const submissionid = Number(req.params.id)
        const attachments = await submissionService.getSubmissionAttachments(submissionid, req.user!.id)
        res.status(200).json({ success: true, data: attachments })
    } catch (error) {
        next(error)
    }
}

export async function deleteAttachment(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const submissionId = Number(
            req.params.id,
        );

        const attachmentId = Number(
            req.params.attachmentId,
        );

        await submissionService.deleteAttachment(
            submissionId,
            attachmentId,
            req.user!.id,
        );

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}