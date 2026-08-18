import { z } from "../lib/zod-extended";

export const createProjectLinkSchema = z
  .object({
    label: z.string().trim().min(1, "Label is required").max(100).openapi({ example: "Design Website" }),
    url: z.string().trim().url("Invalid Url").openapi({ example: "figma.com" }),
    category: z.enum(["design", "development", "docs", "other"]).openapi({ example: "design" }),
  })
  .strict().openapi("CreateProjectLinkInput");

export const updateProjectLinkSchema = z
  .object({
    label: z.string().trim().min(1, "Label is required").max(100).openapi({ example: "Design Website" }),
    url: z.string().trim().url("Invalid Url").openapi({ example: "figma.com" }),
    category: z.enum(["design", "development", "docs", "other"]).openapi({ example: "design" }),
  })
  .strict().partial().refine(
    (data) => {
      const keys = Object.keys(data);
      return keys.length > 0;
    },
    {
      message: "At least one field must be provided to update",
    },
  ).openapi("UpdateProjectLinkInput");

export type CreateProjectLinkInput = z.infer<typeof createProjectLinkSchema>;
export type UpdateProjectLinkInput = z.infer<typeof updateProjectLinkSchema>;
