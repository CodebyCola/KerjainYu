import { z } from "../lib/zod-extended";


export const membershipIdParams = z.object({
    id: z.coerce.number()
})
export const updateInvitationSchema = z.object({
    status: z.enum(["accept", "reject"]).nonoptional()
})
export type MembershipIdParams = z.infer<typeof membershipIdParams>;
