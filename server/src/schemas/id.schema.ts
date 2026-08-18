import { z } from "../lib/zod-extended";


export const idParams = z.object({
    id: z.coerce.number().int().positive()
})