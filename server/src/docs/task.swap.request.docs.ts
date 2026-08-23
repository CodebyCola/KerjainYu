import { registry } from './components';
import { z } from '../lib/zod-extended';
import { idParams } from '../schemas/id.schema';
import { createSwapRequestSchema, respondSwapRequestSchema } from '../schemas/task.swap.request.schema';


// POST /api/v1/tasks/{id}/swap-requests
registry.registerPath({
    method: "post",
    path: "/api/v1/tasks/{id}/swap-requests",
    tags: ["Task Swap Requests"],
    summary: "Create a task swap request",
    description:
        "Creates a swap request for a task assigned to the authenticated user. The request can optionally include another task owned by the target user for a two-way task swap.",
    security: [{ cookieAuth: [] }],

    request: {
        params: idParams,
        body: {
            content: {
                "application/json": {
                    schema: createSwapRequestSchema,
                },
            },
        },
    },

    responses: {
        200: {
            description: "Swap request created successfully",
        },

        400: {
            description: "Invalid request body or parameters",
        },

        401: {
            description: "Not authenticated",
        },

        403: {
            description:
                "The authenticated user does not own the task or does not have access to it",
        },

        404: {
            description:
                "Task, project, or requested member was not found",
        },

        409: {
            description:
                "The task cannot be swapped, target task is invalid, the task already has a pending swap request, or the user attempted to swap with themselves",
        },
    },
});

// PATCH /api/v1/swap-requests/{id}/respond
registry.registerPath({
    method: "patch",
    path: "/api/v1/swap-requests/{id}/respond",
    tags: ["Task Swap Requests"],
    summary: "Respond to a task swap request",
    description:
        "Approves or rejects a pending task swap request. When approved, the task ownership is transferred. For a two-way swap, both task owners are exchanged.",
    security: [{ cookieAuth: [] }],

    request: {
        params: idParams,
        body: {
            content: {
                "application/json": {
                    schema: respondSwapRequestSchema,
                },
            },
        },
    },

    responses: {
        204: {
            description: "Swap request responded to successfully",
        },

        400: {
            description: "Invalid request body or parameters",
        },

        401: {
            description: "Not authenticated",
        },

        403: {
            description:
                "The authenticated user is not authorized to respond to this swap request",
        },

        404: {
            description: "Swap request, task, or project was not found",
        },

        409: {
            description:
                "The swap request has already been responded to",
        },
    },
});

// PATCH /api/v1/swap-requests/{id}/cancel
registry.registerPath({
    method: "patch",
    path: "/api/v1/swap-requests/{id}/cancel",
    tags: ["Task Swap Requests"],
    summary: "Cancel a task swap request",
    description:
        "Cancels a pending task swap request. Only the user who created the swap request can cancel it.",
    security: [{ cookieAuth: [] }],

    request: {
        params: idParams,
    },

    responses: {
        204: {
            description: "Swap request cancelled successfully",
        },

        401: {
            description: "Not authenticated",
        },

        403: {
            description:
                "Only the user who created the swap request can cancel it",
        },

        404: {
            description: "Swap request not found",
        },

        409: {
            description:
                "The swap request has already been responded to",
        },
    },
});

// GET /api/v1/swap-requests/incoming
registry.registerPath({
    method: "get",
    path: "/api/v1/swap-requests/incoming",
    tags: ["Task Swap Requests"],
    summary: "Get pending swap requests addressed to the current user",
    description:
        "Returns pending swap requests where the authenticated user is the requestedTo, joined with task, target task, and sender/receiver info.",
    security: [{ cookieAuth: [] }],

    responses: {
        200: {
            description: "List of pending swap requests addressed to the current user",
        },

        401: {
            description: "Not authenticated",
        },
    },
});

// GET /api/v1/swap-requests/outgoing
registry.registerPath({
    method: "get",
    path: "/api/v1/swap-requests/outgoing",
    tags: ["Task Swap Requests"],
    summary: "Get swap requests created by the current user",
    description:
        "Returns all swap requests (any status) created by the authenticated user, joined with task, target task, and sender/receiver info.",
    security: [{ cookieAuth: [] }],

    responses: {
        200: {
            description: "List of swap requests created by the current user",
        },

        401: {
            description: "Not authenticated",
        },
    },
});