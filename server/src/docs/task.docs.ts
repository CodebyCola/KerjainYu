import { registry } from './components';
import { updateTaskSchema } from '../schemas/task.schema';
import { idParams } from '../schemas/id.schema';

registry.registerPath({
    method: "get",
    path: "/api/v1/tasks",
    tags: ["Tasks"],
    summary: "Get all tasks assigned to the current user",
    description: "Only includes tasks from projects with status 'ongoing'. Tasks from completed/archived projects are excluded.",
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: "List of tasks assigned to the current user" },
        401: { description: "Not authenticated" },
    },
});


registry.registerPath({
    method: "get",
    path: "/api/v1/tasks/{id}",
    tags: ["Tasks"],
    summary: "Show detail task",
    description: "Only the leader & Member of the project can see it.",
    security: [{ cookieAuth: [] }],
    request: {
        params: idParams,
    },
    responses: {
        200: { description: "Task retieved successfully" },
        400: { description: "Validation error" },
        401: { description: "Not authenticated" },
        403: { description: "Only the project member can see this task" },
        404: { description: "Task not found" },
    },
});


registry.registerPath({
    method: "patch",
    path: "/api/v1/tasks/{id}",
    tags: ["Tasks"],
    summary: "Update a task",
    description: "Only the leader of the task's project can update it.",
    security: [{ cookieAuth: [] }],
    request: {
        params: idParams,
        body: { content: { "application/json": { schema: updateTaskSchema } } },
    },
    responses: {
        200: { description: "Task updated successfully" },
        400: { description: "Validation error" },
        401: { description: "Not authenticated" },
        403: { description: "Only the project leader can update this task" },
        404: { description: "Task not found" },
    },
});

registry.registerPath({
    method: "patch",
    path: "/api/v1/tasks/{id}/claim",
    tags: ["Tasks"],
    summary: "Claim an unclaimed task from the task pool",
    description: "Only tasks with isClaimable=true and status='unclaimed' can be claimed. The claim is atomic — if two members claim the same task simultaneously, only the first one succeeds; the second receives 409. Records the claim in the task ownership log.",
    security: [{ cookieAuth: [] }],
    request: {
        params: idParams,
    },
    responses: {
        200: { description: "Task claimed successfully. Returns the updated task (assigneeId set, status changed to 'todo')." },
        401: { description: "Not authenticated" },
        403: { description: "You're not a member of this task's project" },
        404: { description: "Task not found" },
        409: { description: "Task is not claimable, or has already been claimed by someone else" },
    },
});

registry.registerPath({
    method: "patch",
    path: "/api/v1/tasks/{id}/ongoing",
    tags: ["Tasks"],
    summary: "Start working on a task",
    description:
        "Changes a task status from 'todo' to 'ongoing'. Only the user assigned to the task can perform this action.",

    security: [{ cookieAuth: [] }],

    request: {
        params: idParams,
    },

    responses: {
        200: {
            description: "Task successfully changed to ongoing",
        },

        400: {
            description: "Validation error",
        },

        401: {
            description: "Not authenticated",
        },

        403: {
            description:
                "User is not a member of the project or is not the task assignee",
        },

        404: {
            description: "Task not found",
        },

        409: {
            description:
                "Task cannot be started because its current status is not 'todo'",
        },
    },
});