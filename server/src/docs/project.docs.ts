// Projects'
import { createProjectWithLinksSchema, updateProjectSchema } from '../schemas/projectSchema';
import { registry } from './components';
import { projectIdParams } from './params/project.params';


registry.registerPath({
    method: "post",
    path: "/api/v1/projects",
    tags: ["Projects"],
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            content: { "application/json": { schema: createProjectWithLinksSchema } },
        },
    },
    responses: {
        201: { description: "Project created successfully" },
        400: { description: "Validation error" },
        401: { description: "Not authenticated" },
    },
});

registry.registerPath({
    method: "patch",
    path: "/api/v1/projects/{id}",
    tags: ["Projects"],
    security: [{ cookieAuth: [] }],
    request: {
        params: projectIdParams,
        body: {
            content: { "application/json": { schema: updateProjectSchema } },
        },
    },
    responses: {
        200: { description: "Project updated successfully" },
        400: { description: "Validation error" },
        401: { description: "Not authenticated" },
        403: { description: "You are not a member of this project" },
        404: { description: "Project not found" },
    },

});

registry.registerPath({
    method: "get",
    path: "/api/v1/projects/{id}",
    tags: ["Projects"],
    security: [{ cookieAuth: [] }],
    request: {
        params: projectIdParams,
    },
    responses: {
        200: { description: "Successfully fetched project detail" },
        401: { description: "Not authenticated" },
        403: { description: "That project does not belong to the user" },
        404: { description: "Project not found" },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/v1/projects",
    tags: ["Projects"],
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: "Successfully fetched All user projects" },
        401: { description: "Not authenticated" },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/v1/projects/{id}/members",
    tags: ["Projects"],
    request: { params: projectIdParams },
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: "Successfully fecth all members that belong to project" },
        401: { description: "Not authenticated" },
        403: { description: "That project does not belong to the user" },
    }
})

registry.registerPath({
    method: "get",
    path: "/api/v1/projects/{id}/tasks",
    tags: ["Projects"],
    request: { params: projectIdParams },
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: "Successfully fecth all tasks that belong to project" },
        401: { description: "Not authenticated" },
        403: { description: "That project does not belong to the user" },
    }
})