// docs/params/project.params.ts
import { z } from "zod";

export const projectIdParams = z.object({
    id: z.coerce.number(),
});