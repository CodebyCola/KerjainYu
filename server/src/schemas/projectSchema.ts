import { z } from "zod";
import { createProjectLinkSchema } from "./projectLinkSchema";
export const createProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title must filled")
    .max(150, "Title must be at most 150 characters"),
  allowFreeSwap: z.boolean().default(false),
  deadline: z.coerce.date().optional(),
});
export const createProjectWithLinksSchema = z
  .object({
    project: createProjectSchema,
    links: z.array(createProjectLinkSchema).optional().default([]),
  })
  .strict();

export const updateProjectSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title must filled")
      .max(150, "Title must be at most 150 characters"),
    allowFreeSwap: z.boolean().default(false),
    status: z.enum(["ongoing", "completed"]).optional(),
    deadline: z.coerce.date().optional(),
    isArchived: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field mut be provided to update",
  });

export type CreateProjectWithLinksInput = z.infer<
  typeof createProjectWithLinksSchema
>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
