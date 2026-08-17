import { registry } from './components';
import { projectIdParams } from './params/id.params';
import { userIdParams } from '../schemas/userSchema';

registry.registerPath({
    method: "get",
    path: "/api/v1/projects/{id}/members",
    tags: ["Projects Members"],
    request: { params: projectIdParams },
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