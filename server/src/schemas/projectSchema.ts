import { z } from "../lib/zod-extended";
import { createProjectLinkSchema } from "./projectLinkSchema";

export const createProjectSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3)
      .max(150)
      .openapi({ example: "Website Redesign" }),
    allowFreeSwap: z.boolean().optional().default(false),
    deadline: z.coerce
      .date()
      .optional()
      .openapi({ example: "2026-09-01T00:00:00.000Z" }),
  })
  .strict()
  .openapi("CreateProjectInput");

export const createProjectWithLinksSchema = z
  .object({
    project: createProjectSchema,
    links: z.array(createProjectLinkSchema).optional().default([]),
  })
  .strict()
  .openapi("CreateProjectWithLinksInput");

export const updateProjectSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title must filled")
      .max(150, "Title must be at most 150 characters")
      .openapi({ example: "Website Server" }),
    allowFreeSwap: z.boolean().default(false).openapi({ example: false }),
    status: z.enum(["ongoing", "completed"]).optional(),
    deadline: z.coerce.date().optional(),
    isArchived: z.boolean().optional(),
    isArchivedAt: z.date().optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field mut be provided to update",
  })
  .openapi("UpdateProjectInput");

export type CreateProjectWithLinksInput = z.infer<
  typeof createProjectWithLinksSchema
>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
