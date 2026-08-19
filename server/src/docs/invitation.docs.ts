import { registry } from './components';
import { updateInvitationSchema } from '../schemas/invitation.schema';
import { idParams } from '../schemas/id.schema';

registry.registerPath({
    method: "get",
    path: "/api/v1/invitations",
    tags: ["Invitations"],
    summary: "Get all pending invitations for the current user",
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: "List of pending invitations (status: 'invited') addressed to the current user" },
        401: { description: "Not authenticated" },
    },
});

registry.registerPath({
    method: "patch",
    path: "/api/v1/invitations/{id}",
    tags: ["Invitations"],
    summary: "Accept or reject a project invitation",
    description: "Only the invited user may respond. Responding twice to the same invitation returns 409.",
    security: [{ cookieAuth: [] }],
    request: {
        params: idParams,
        body: { content: { "application/json": { schema: updateInvitationSchema } } },
    },
    responses: {
        200: { description: "Invitation status updated ('active' if accepted, 'rejected' if declined)" },
        400: { description: "Validation error" },
        401: { description: "Not authenticated" },
        403: { description: "This invitation does not belong to you" },
        404: { description: "Invitation not found" },
        409: { description: "This invitation has already been responded to" },
    },
});