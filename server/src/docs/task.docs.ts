import { registry } from './components';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema';
import { projectIdParams, taskIdParams } from './params/id.params';

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
    method: "patch",
    path: "/api/v1/tasks/{id}",
    tags: ["Tasks"],
    summary: "Update a task",
    description: "Only the leader of the task's project can update it.",
    security: [{ cookieAuth: [] }],
    request: {
        params: taskIdParams,
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
