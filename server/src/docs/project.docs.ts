// Projects'
import { createProjectWithLinksSchema, updateProjectSchema } from '../schemas/projectSchema';
import { registry } from './components';
import { createTaskSchema } from '../schemas/task.schema';
import { projectIdParams } from './params/id.params';
import { userIdParams } from '../schemas/userSchema';


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
    method: "post",
    path: "/api/v1/projects/{id}/tasks",
    tags: ["Tasks"],
    summary: "Create a new task within a project",
    description: "Only the project leader can create tasks. `createdBy` is taken from the authenticated user, not from the request body.",
    security: [{ cookieAuth: [] }],
    request: {
        params: projectIdParams,
        body: { content: { "application/json": { schema: createTaskSchema } } },
    },
    responses: {
        201: { description: "Task created successfully. Returns the newly created task." },
        400: { description: "Validation error (e.g. title missing)" },
        401: { description: "Not authenticated" },
        403: { description: "Only the project leader can create tasks" },
        404: { description: "Project not found" },
    },
});


registry.registerPath({
    method: "get",
    path: "/api/v1/projects/{id}/tasks",
    tags: ["Tasks"],
    summary: "Get all tasks belonging to a project",
    description: "Accessible to any active member of the project (leader or regular member).",
    security: [{ cookieAuth: [] }],
    request: { params: projectIdParams },
    responses: {
        200: { description: "List of tasks in this project" },
        401: { description: "Not authenticated" },
        403: { description: "You're not a member of this project" },
        404: { description: "Project not found" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/v1/projects/{id}/invitations",
    tags: ["Invitations"],
    summary: "Invite a user to join the project",
    description: "Only the project leader can send invitations. Creates a project_members row with status 'invited'.",
    security: [{ cookieAuth: [] }],
    request: {
        params: projectIdParams,
        body: { content: { "application/json": { schema: userIdParams } } },
    },
    responses: {
        200: { description: "Invitation sent successfully" },
        400: { description: "Validation error" },
        401: { description: "Not authenticated" },
        403: { description: "Only the project leader can invite members" },
        404: { description: "Project or target user not found" },
        409: { description: "User is already a member, already invited, or you tried to invite yourself" },
    },
});


