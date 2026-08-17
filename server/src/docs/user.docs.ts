import { registry } from './components';
import { z } from '../lib/zod-extended';

registry.registerPath({
    method: "get",
    path: "/api/v1/users/search",
    tags: ["Users"],
    summary: "Search users by username",
    description: "Used to find users to invite to a project. Pass excludeProjectId to filter out users who are already a member/invited/rejected on that project.",
    security: [{ cookieAuth: [] }],
    request: {
        query: z.object({
            username: z.string().min(1).openapi({ example: "budi" }),
            excludeProjectId: z.coerce.number().int().positive().optional().openapi({ example: 5 }),
        }),
    },
    responses: {
        200: { description: "List of matching users (max 10), returns only id, username, fullName, avatarUrl" },
        401: { description: "Not authenticated" },
    },
});