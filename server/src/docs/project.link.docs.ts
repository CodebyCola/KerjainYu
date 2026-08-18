import { idParams } from "../schemas/id.schema";
import { createProjectLinkSchema, updateProjectLinkSchema } from "../schemas/projectLinkSchema";
import { registry } from './components';

registry.registerPath({
    method: "post",
    path: "/api/v1/projects/{id}/links",
    tags: ["Projects"],
    summary: "Add a link to a project",
    description: "Only the project leader can add a link to the project.",
    security: [{ cookieAuth: [] }],

    request: {
        params: idParams,
        body: {
            content: {
                "application/json": {
                    schema: createProjectLinkSchema,
                },
            },
        },
    },

    responses: {
        201: {
            description: "Link successfully added to the project",
        },
        400: {
            description: "Validation error",
        },
        401: {
            description: "Not authenticated",
        },
        403: {
            description: "User is not the project leader",
        },
        404: {
            description: "Project not found",
        },
        409: {
            description: "A link with this URL already exists in the project",
        },
    },
});

registry.registerPath({
    method: "patch",
    path: "/api/v1/links/{id}",
    tags: ["Projects"],
    summary: "Update a project link",
    description: "Only the project leader can update a project link.",
    security: [{ cookieAuth: [] }],

    request: {
        params: idParams,
        body: {
            content: {
                "application/json": {
                    schema: updateProjectLinkSchema,
                },
            },
        },
    },

    responses: {
        200: {
            description: "Link successfully updated",
        },
        400: {
            description: "Validation error",
        },
        401: {
            description: "Not authenticated",
        },
        403: {
            description: "User is not the project leader",
        },
        404: {
            description: "Link or project not found",
        },
        409: {
            description: "A link with this URL already exists in the project",
        },
    },
});

registry.registerPath({
    method: "delete",
    path: "/api/v1/links/{id}",
    tags: ["Projects"],
    summary: "Delete a project link",
    description: "Only the project leader can delete a project link.",
    security: [{ cookieAuth: [] }],

    request: {
        params: idParams,
    },

    responses: {
        204: {
            description: "Link successfully deleted",
        },
        400: {
            description: "Validation error",
        },
        401: {
            description: "Not authenticated",
        },
        403: {
            description: "User is not the project leader",
        },
        404: {
            description: "Link or project not found",
        },
    },
});