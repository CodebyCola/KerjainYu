import { registry } from "./components";
import {
    createSubmissionSchema,
    reviewSubmissionSchema,
    createAttachmentSchema,
    submissionContentAttachmentSchema,
} from "../schemas/submission.schema";
import { idParams, submissionAttachmentParams } from "../schemas/id.schema";


// =====================================================
// POST /api/v1/tasks/:id/submissions
// =====================================================

registry.registerPath({
    method: "post",
    path: "/api/v1/tasks/{id}/submissions",
    tags: ["Submissions"],
    security: [{ cookieAuth: [] }],

    summary: "Submit a task for review",

    description:
        "Allows the assigned user to submit their task for project leader review. " +
        "The task must be in 'ongoing' or 'in_revision' status. " +
        "The authenticated user must be the current task assignee. " +
        "A submission may contain an optional note.",

    request: {
        params: idParams,

        body: {
            content: {
                "application/json": {
                    schema: createSubmissionSchema,
                },
            },
            required: true,
        },
    },

    responses: {
        201: {
            description: "Task submitted successfully",

            content: {
                "application/json": {
                    schema: {
                        type: "object",

                        properties: {
                            success: {
                                type: "boolean",
                                example: true,
                            },

                            data: {
                                type: "object",

                                properties: {
                                    id: {
                                        type: "integer",
                                        example: 370,
                                    },

                                    taskId: {
                                        type: "integer",
                                        example: 728,
                                    },

                                    submittedBy: {
                                        type: "integer",
                                        example: 1936,
                                    },

                                    note: {
                                        type: "string",
                                        nullable: true,
                                        example:
                                            "Submission for review.",
                                    },

                                    reviewStatus: {
                                        type: "string",
                                        enum: [
                                            "pending",
                                            "approved",
                                            "revision_requested",
                                            "rejected",
                                        ],
                                        example: "pending",
                                    },

                                    reviewNote: {
                                        type: "string",
                                        nullable: true,
                                        example: null,
                                    },

                                    reviewedBy: {
                                        type: "integer",
                                        nullable: true,
                                        example: null,
                                    },

                                    reviewedAt: {
                                        type: "string",
                                        format: "date-time",
                                        nullable: true,
                                        example: null,
                                    },

                                    submittedAt: {
                                        type: "string",
                                        format: "date-time",
                                        example:
                                            "2026-08-21T04:20:08.050Z",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },

        400: {
            description: "Invalid request body or task ID",
        },

        401: {
            description: "Authentication required",
        },

        403: {
            description:
                "User is not the assignee of the task or does not have access to the project",
        },

        404: {
            description: "Task not found",
        },

        409: {
            description:
                "Task cannot be submitted because its current status does not allow submission or the task has already been submitted",
        },

        422: {
            description: "Validation error",
        },
    },
});


// =====================================================
// POST /api/v1/submissions/:id/attachments
// =====================================================

registry.registerPath({
    method: "post",
    path: "/api/v1/submissions/{id}/attachments",
    tags: ["Submissions"],
    security: [{ cookieAuth: [] }],

    summary: "Add an attachment to a submission",

    description:
        "Adds an attachment to an existing submission. " +
        "An attachment can either contain text/link content or reference a file/image " +
        "that has already been uploaded to object storage using a presigned upload URL. " +
        "Only the task assignee can add attachments. " +
        "Attachments cannot be added after the submission has been approved or rejected.",

    request: {
        params: idParams,

        body: {
            content: {
                "application/json": {
                    schema: createAttachmentSchema,
                },
            },
            required: true,
        },
    },

    responses: {
        201: {
            description: "Attachment created successfully",

            content: {
                "application/json": {
                    schema: {
                        type: "object",

                        properties: {
                            success: {
                                type: "boolean",
                                example: true,
                            },

                            data: {
                                type: "object",

                                properties: {
                                    contentAttachment: {
                                        nullable: true,
                                        oneOf: [
                                            {
                                                type: "object",
                                                properties: {
                                                    id: {
                                                        type: "integer",
                                                        example: 121,
                                                    },

                                                    submissionId: {
                                                        type: "integer",
                                                        example: 370,
                                                    },

                                                    type: {
                                                        type: "string",
                                                        enum: [
                                                            "text",
                                                            "link",
                                                        ],
                                                        example: "text",
                                                    },

                                                    content: {
                                                        type: "string",
                                                        example:
                                                            "This is my submission.",
                                                    },

                                                    createdAt: {
                                                        type: "string",
                                                        format: "date-time",
                                                        example:
                                                            "2026-08-23T04:14:47.245Z",
                                                    },
                                                },
                                            },
                                            {
                                                type: "null",
                                            },
                                        ],
                                    },

                                    fileAttachment: {
                                        nullable: true,
                                        oneOf: [
                                            {
                                                type: "object",
                                                properties: {
                                                    id: {
                                                        type: "integer",
                                                        example: 122,
                                                    },

                                                    submissionId: {
                                                        type: "integer",
                                                        example: 370,
                                                    },

                                                    type: {
                                                        type: "string",
                                                        enum: [
                                                            "file",
                                                            "image",
                                                        ],
                                                        example: "file",
                                                    },

                                                    objectKey: {
                                                        type: "string",
                                                        example:
                                                            "submissions/370/550e8400-e29b-41d4-a716-446655440000.pdf",
                                                    },

                                                    fileName: {
                                                        type: "string",
                                                        example:
                                                            "report.pdf",
                                                    },

                                                    mimeType: {
                                                        type: "string",
                                                        example:
                                                            "application/pdf",
                                                    },

                                                    fileSize: {
                                                        type: "integer",
                                                        example: 2458123,
                                                    },

                                                    createdAt: {
                                                        type: "string",
                                                        format: "date-time",
                                                        example:
                                                            "2026-08-23T04:14:47.245Z",
                                                    },
                                                },
                                            },
                                            {
                                                type: "null",
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },

        400: {
            description: "Invalid submission ID or request body",
        },

        401: {
            description: "Authentication required",
        },

        403: {
            description:
                "Authenticated user is not the assignee of the task or the provided object key is invalid",
        },

        404: {
            description:
                "Submission or associated task was not found",
        },

        409: {
            description:
                "Submission has already been approved or rejected and cannot receive new attachments",
        },

        422: {
            description: "Validation error",
        },
    },
});


// =====================================================
// GET /api/v1/submissions/:id/attachments
// =====================================================

registry.registerPath({
    method: "get",
    path: "/api/v1/submissions/{id}/attachments",
    tags: ["Submissions"],
    security: [{ cookieAuth: [] }],

    summary: "Get submission attachments",

    description:
        "Returns all attachments belonging to a submission. " +
        "The authenticated user must be a member of the project associated with the submission.",

    request: {
        params: idParams,
    },

    responses: {
        200: {
            description: "Submission attachments retrieved successfully",

            content: {
                "application/json": {
                    schema: {
                        type: "object",

                        properties: {
                            success: {
                                type: "boolean",
                                example: true,
                            },

                            data: {
                                type: "array",

                                items: {
                                    type: "object",

                                    properties: {
                                        id: {
                                            type: "integer",
                                            example: 121,
                                        },

                                        submissionId: {
                                            type: "integer",
                                            example: 370,
                                        },

                                        type: {
                                            type: "string",
                                            enum: [
                                                "text",
                                                "link",
                                                "file",
                                                "image",
                                            ],
                                            example: "file",
                                        },

                                        content: {
                                            type: "string",
                                            nullable: true,
                                            example: null,
                                        },

                                        objectKey: {
                                            type: "string",
                                            nullable: true,
                                            example:
                                                "submissions/370/550e8400-e29b-41d4-a716-446655440000.pdf",
                                        },

                                        fileName: {
                                            type: "string",
                                            nullable: true,
                                            example: "report.pdf",
                                        },

                                        mimeType: {
                                            type: "string",
                                            nullable: true,
                                            example: "application/pdf",
                                        },

                                        fileSize: {
                                            type: "integer",
                                            nullable: true,
                                            example: 2458123,
                                        },

                                        createdAt: {
                                            type: "string",
                                            format: "date-time",
                                            example:
                                                "2026-08-23T04:14:47.245Z",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },

        401: {
            description: "Authentication required",
        },

        403: {
            description:
                "Authenticated user is not a member of the project",
        },

        404: {
            description:
                "Submission or associated task was not found",
        },
    },
});


// =====================================================
// DELETE /api/v1/submissions/:id/attachments/:attachmentId
// =====================================================

registry.registerPath({
    method: "delete",
    path: "/api/v1/submissions/{id}/attachments/{attachmentId}",
    tags: ["Submissions"],
    security: [{ cookieAuth: [] }],

    summary: "Delete a submission attachment",

    description:
        "Deletes an attachment from a submission. " +
        "The task assignee or project leader can delete an attachment. " +
        "For file and image attachments, the associated object is also deleted from object storage. " +
        "The attachment ID must belong to the specified submission.",

    request: {
        params: submissionAttachmentParams
    },

    responses: {
        204: {
            description:
                "Attachment deleted successfully",
        },

        401: {
            description: "Authentication required",
        },

        403: {
            description:
                "Authenticated user is neither the task assignee nor the project leader",
        },

        404: {
            description:
                "Submission, task, or attachment was not found, or the attachment does not belong to the specified submission",
        },
    },
});


// =====================================================
// PATCH /api/v1/submissions/:id/review
// =====================================================

registry.registerPath({
    method: "patch",
    path: "/api/v1/submissions/{id}/review",
    tags: ["Submissions"],
    security: [{ cookieAuth: [] }],

    summary: "Review a task submission",

    description:
        "Allows a project leader to review a submitted task. " +
        "The leader can approve the submission, request a revision, or reject it. " +
        "A review note is required when requesting a revision or rejecting a submission.",

    request: {
        params: idParams,

        body: {
            content: {
                "application/json": {
                    schema: reviewSubmissionSchema,
                },
            },
            required: true,
        },
    },

    responses: {
        200: {
            description: "Submission reviewed successfully",

            content: {
                "application/json": {
                    schema: {
                        type: "object",

                        properties: {
                            success: {
                                type: "boolean",
                                example: true,
                            },

                            data: {
                                type: "object",

                                properties: {
                                    id: {
                                        type: "integer",
                                        example: 370,
                                    },

                                    taskId: {
                                        type: "integer",
                                        example: 728,
                                    },

                                    submittedBy: {
                                        type: "integer",
                                        example: 1936,
                                    },

                                    note: {
                                        type: "string",
                                        nullable: true,
                                        example:
                                            "Submission for review.",
                                    },

                                    reviewStatus: {
                                        type: "string",
                                        enum: [
                                            "pending",
                                            "approved",
                                            "revision_requested",
                                            "rejected",
                                        ],
                                        example: "approved",
                                    },

                                    reviewNote: {
                                        type: "string",
                                        nullable: true,
                                        example:
                                            "Good work. The implementation meets the requirements.",
                                    },

                                    reviewedBy: {
                                        type: "integer",
                                        example: 1930,
                                    },

                                    reviewedAt: {
                                        type: "string",
                                        format: "date-time",
                                        example:
                                            "2026-08-21T05:20:08.050Z",
                                    },

                                    submittedAt: {
                                        type: "string",
                                        format: "date-time",
                                        example:
                                            "2026-08-21T04:20:08.050Z",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },

        400: {
            description: "Invalid request body or submission ID",
        },

        401: {
            description: "Authentication required",
        },

        403: {
            description:
                "Authenticated user is not the project leader",
        },

        404: {
            description:
                "Submission or associated task was not found",
        },

        409: {
            description:
                "Submission cannot be reviewed because it has already been resolved or is not in a reviewable state",
        },

        422: {
            description: "Validation error",
        },
    },
});


// =====================================================
// GET /api/v1/projects/:id/pending-submissions
// =====================================================

registry.registerPath({
    method: "get",
    path: "/api/v1/projects/{id}/pending-submissions",
    tags: ["Submissions"],
    security: [{ cookieAuth: [] }],

    summary: "Get pending submissions for a project",

    description:
        "Returns all task submissions with 'pending' review status " +
        "belonging to the specified project. Only the project leader can access this endpoint. " +
        "Results are ordered by submission time in ascending order.",

    request: {
        params: idParams,
    },

    responses: {
        200: {
            description: "Pending submissions retrieved successfully",

            content: {
                "application/json": {
                    schema: {
                        type: "object",

                        properties: {
                            success: {
                                type: "boolean",
                                example: true,
                            },

                            data: {
                                type: "array",

                                items: {
                                    type: "object",

                                    properties: {
                                        id: {
                                            type: "integer",
                                            example: 370,
                                        },

                                        taskId: {
                                            type: "integer",
                                            example: 728,
                                        },

                                        submittedBy: {
                                            type: "integer",
                                            example: 1936,
                                        },

                                        note: {
                                            type: "string",
                                            nullable: true,
                                            example:
                                                "Submission for review.",
                                        },

                                        reviewStatus: {
                                            type: "string",
                                            enum: [
                                                "pending",
                                                "approved",
                                                "revision_requested",
                                                "rejected",
                                            ],
                                            example: "pending",
                                        },

                                        reviewNote: {
                                            type: "string",
                                            nullable: true,
                                            example: null,
                                        },

                                        reviewedBy: {
                                            type: "integer",
                                            nullable: true,
                                            example: null,
                                        },

                                        reviewedAt: {
                                            type: "string",
                                            format: "date-time",
                                            nullable: true,
                                            example: null,
                                        },

                                        submittedAt: {
                                            type: "string",
                                            format: "date-time",
                                            example:
                                                "2026-08-21T04:20:08.050Z",
                                        },

                                        taskTitle: {
                                            type: "string",
                                            example:
                                                "Implement authentication flow",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },

        400: {
            description: "Invalid project ID",
        },

        401: {
            description: "Authentication required",
        },

        403: {
            description:
                "Authenticated user is not the project leader",
        },

        404: {
            description: "Project not found",
        },
    },
});