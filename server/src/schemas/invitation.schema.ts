import { z } from "../lib/zod-extended";

export const updateInvitationSchema = z.object({
    status: z.enum(["accept", "reject"]).nonoptional()
})
