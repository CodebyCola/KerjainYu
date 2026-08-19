import { z } from "../lib/zod-extended";

export const removeMemberParams = z.object({
    id: z.coerce.number().int().positive(),
    userId: z.coerce.number().int().positive(),
});

