import { registry } from './components';
import { userIdParams } from '../schemas/userSchema';
import { idParams } from '../schemas/id.schema';
import { removeMemberParams } from '../schemas/project.member.schema';

registry.registerPath({
    method: "get",
    path: "/api/v1/projects/{id}/members",
    tags: ["Projects Members"],
    request: { params: idParams },
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: "Successfully fecth all members that belong to project" },
        401: { description: "Not authenticated" },
        403: { description: "That project does not belong to the user" },
    }
})

registry.registerPath({
    method: "patch",
    path: "/api/v1/projects/{id}/leader",
    tags: ["Project Members"],
    security: [{ cookieAuth: [] }],
    request: {
        params: idParams,
        body: {
            content: {
                "application/json": { schema: userIdParams }
            }
        }
    },
    responses: {

        200: { description: "Successfuly promote a new leader" },
        400: { description: "Validation error" },
        401: { description: "Not authenticated" },
        403: { description: "Only the current project leader can promote members to leader" },
        // 404: { description: "Project or target user not found" },
        409: { description: "1. Current project trying to promote themselves into leader, 2. Prospective Member who gonna become the leader is not active" },

    }
})

registry.registerPath({
    method: "delete",
    path: "/api/v1/projects/{id}/members/{userId}",
    tags: ["Projects Members"],
    summary: "Remove a member from a project",
    description:
        "Allows the project leader to remove an active member from the project. All tasks assigned to the removed member in the project are automatically unassigned.",
    security: [{ cookieAuth: [] }],

    request: {
        params: removeMemberParams
    },

    responses: {
        204: {
            description: "Successfully removed the member",
        },

        400: {
            description: "Validation error",
        },

        401: {
            description: "Not authenticated",
        },

        403: {
            description: "Only the project leader can remove members",
        },

        404: {
            description: "Project or membership not found",
        },

        409: {
            description:
                "The target member is inactive or the leader attempted to remove themselves",
        },
    },
});
registry.registerPath({
    method: "post",
    path: "/api/v1/projects/{id}/leave",
    tags: ["Projects Members"],
    summary: "Leave a project",
    description:
        "Allows an active project member to leave the project. All tasks assigned to the member in the project are automatically unassigned.",

    security: [{ cookieAuth: [] }],

    request: {
        params: idParams,
    },

    responses: {
        204: {
            description: "Successfully left the project",
        },

        400: {
            description: "Invalid project ID",
        },

        401: {
            description: "Not authenticated",
        },

        404: {
            description: "Project or membership not found",
        },

        409: {
            description: "The membership is not active",
        },
    },
});