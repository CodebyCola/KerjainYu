
import { createCommentSchema } from '../schemas/comment.task.schema';
import { registry } from './components';
import { taskIdParams } from './params/id.params';


registry.registerPath({
    method: "get",
    path: "/api/v1/tasks/{id}/comments",
    tags: ["Tasks"],
    summary: "Get all comments on a task",
    description: "Accessible to any active member of the task's project.",
    security: [{ cookieAuth: [] }],
    request: { params: taskIdParams },
    responses: {
        200: { description: "List of comments, ordered chronologically" },
        401: { description: "Not authenticated" },
        403: { description: "You're not a member of this task's project" },
        404: { description: "Task not found" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/v1/tasks/{id}/comments",
    tags: ["Tasks"],
    summary: "Add a comment to a task",
    description: "Accessible to any active member of the task's project.",
    security: [{ cookieAuth: [] }],
    request: {
        params: taskIdParams,
        body: { content: { "application/json": { schema: createCommentSchema } } },
    },
    responses: {
        201: { description: "Comment created successfully" },
        400: { description: "Validation error (e.g. empty comment)" },
        401: { description: "Not authenticated" },
        403: { description: "You're not a member of this task's project" },
        404: { description: "Task not found" },
    },
});