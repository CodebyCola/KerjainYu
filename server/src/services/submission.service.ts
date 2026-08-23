import { db } from "../database/db"
import * as submissionRepo from "../database/repositories/submission.repository"
import * as taskRepo from "../database/repositories/task.repository"
import { ConflictError, ForbiddenError, NotFoundError } from "../errors/AppError"
import { CreateFileAttachmentInput, CreateFileUploadUrlInput, CreateSubmissionInput, ReviewSubmissionInput } from "../schemas/submission.schema"
import * as storageService from "./storage.service"
import { assertProjectLeader } from "./helper/auhtorization.helper"
import { assertTaskAccess } from "./helper/task.helper"

//POST /api/v1/tasks/:id/submissions
export async function createSubmission(
    taskId: number,
    submittedBy: number,
    input: CreateSubmissionInput,
) {
    const task = await assertTaskAccess(taskId, submittedBy);

    if (task.assigneeId != submittedBy) {
        throw new ForbiddenError(
            "Only the assignee can submit the task"
        );
    }

    if (!["in_revision", "ongoing"].includes(task.status)) {
        throw new ConflictError(
            "Only task in status revision & ongoing that can be submitted"
        );
    }

    return db.transaction(async (trx) => {
        const submission = await submissionRepo.createSubmission(
            {
                taskId,
                submittedBy,
                note: input.note,
            },
            trx
        );

        // text / link attachments only
        if (input.contents.length > 0) {
            await submissionRepo.createContentAttachments(
                submission.id,
                input.contents,
                trx
            );
        }

        const updatedTask =
            await taskRepo.updateTaskStatusIfAllowed(
                task.id,
                ["ongoing", "in_revision"],
                "submitted",
                trx
            );

        if (!updatedTask) {
            throw new ConflictError(
                "This task has already been submitted"
            );
        }

        return submission;
    });
}

// POST /api/v1/submissions/:id/attachments/upload-url -> Used to provide the presigned url to the client
export async function createAttachmentUploadUrl(
    submissionId: number,
    userId: number,
    input: CreateFileUploadUrlInput,
) {
    const submission =
        await submissionRepo.getSubmissionById(submissionId);

    if (!submission) {
        throw new NotFoundError("Submission is not found");
    }

    const task =
        await taskRepo.getTaskById(submission.taskId);

    if (!task) {
        throw new NotFoundError("Task is not found");
    }

    if (task.assigneeId != userId) {
        throw new ForbiddenError(
            "Only the assignee can upload submission attachments",
        );
    }

    if (!["pending", "revision_requested"].includes(submission.reviewStatus)) {
        throw new ConflictError("Cannot upload attachments to a reviewed submission");
    }

    return storageService.createSubmissionUploadUrl(
        submissionId,
        input.fileName,
        input.mimeType,
    );
}

//POST /api/v1/submissions/:id/attachments -> For saving metadata to database
export async function createFileAttachment(
    submissionId: number,
    userId: number,
    input: CreateFileAttachmentInput,
) {
    const submission =
        await submissionRepo.getSubmissionById(
            submissionId,
        );

    if (!submission) {
        throw new NotFoundError(
            "Submission is not found",
        );
    }

    const task =
        await taskRepo.getTaskById(
            submission.taskId,
        );

    if (!task) {
        throw new NotFoundError(
            "Task is not found",
        );
    }

    if (task.assigneeId != userId) {
        throw new ForbiddenError(
            "Only the assignee can attach files to this submission",
        );
    }

    if (!["pending", "revision_requested"].includes(submission.reviewStatus)
    ) {
        throw new ConflictError(
            "Cannot attach file to a reviewed submission",
        );
    }

    if (!input.objectKey.startsWith(`submissions/${submissionId}/`,)) {
        throw new ForbiddenError(
            "Invalid object key",
        );
    }

    return db.transaction(async (trx) => {
        return submissionRepo.createFileAttachment(
            {
                submissionId,
                type: input.type,
                objectKey: input.objectKey,
                fileName: input.fileName,
                mimeType: input.mimeType,
                fileSize: input.fileSize,
            },
            trx,
        );
    });
}

//PATCH /api/v1/submissions/:id/review
export async function reviewSubmission(submissionId: number, leaderId: number, input: ReviewSubmissionInput) {
    const submission = await submissionRepo.getSubmissionById(submissionId)
    if (!submission) {
        throw new NotFoundError("Submission is not found")
    }
    const task = await taskRepo.getTaskById(submission.taskId)
    if (!task) {
        throw new NotFoundError("Task is not found")
    }
    await assertProjectLeader(task.projectId, leaderId)
    if (!['pending', 'revision_requested'].includes(submission.reviewStatus)) {
        throw new ConflictError("Only submission on pending and revision that can be reviewed")
    }
    return db.transaction(async (trx) => {
        const updated = await submissionRepo.reviewSubmission(submissionId, { ...input, reviewedBy: leaderId }, trx)
        if (!updated) {
            throw new ConflictError(
                "This submission has already been reviewed"
            );
        }
        if (input.reviewStatus == 'approved') {
            await taskRepo.updateTask(task.id, { status: "approved" }, trx)
        } else if (input.reviewStatus == 'revision_requested') {
            await taskRepo.updateTask(task.id, { status: "in_revision" }, trx)
        } else if (input.reviewStatus == 'rejected') {
            await taskRepo.updateTask(task.id, { status: "rejected" }, trx)
        }

        return updated
    })
}

//GET /api/v1/projects/:id/pending-submissions
export async function pendingSubmissionsByProject(projectId: number, leaderId: number) {
    await assertProjectLeader(projectId, leaderId)
    const submissions = await submissionRepo.getPendingSubmissionsByProject(projectId)
    return submissions
}