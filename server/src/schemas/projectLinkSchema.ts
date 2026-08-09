import { z } from "../lib/zod-extended";

export const createProjectLinkSchema = z
  .object({
    label: z.string().trim().min(1, "Label is required").max(100),
    url: z.string().trim().url("Invalid Url"),
    category: z.enum(["design", "development", "docs", "other"]),
  })
  .strict();

export type CreateProjectLinkInput = z.infer<typeof createProjectLinkSchema>;
