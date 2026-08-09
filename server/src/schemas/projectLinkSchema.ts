import { z } from "../lib/zod-extended";

export const createProjectLinkSchema = z
  .object({
    label: z
      .string()
      .trim()
      .min(1, "Label is required")
      .max(100)
      .openapi({ example: "budi123" }),
    url: z.string().trim().url("Invalid Url").openapi({ example: "figma.com" }),
    category: z
      .enum(["design", "development", "docs", "other"])
      .openapi({ example: "design" }),
  })
  .strict()
  .openapi("CreateProjectLinkInput");

export type CreateProjectLinkInput = z.infer<typeof createProjectLinkSchema>;
