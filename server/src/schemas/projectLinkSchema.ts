// src/schemas/projectSchema.ts
import { z } from "../lib/zod-extended";
import { createProjectLinkSchema } from "./projectLinkSchema";

export const createProjectSchema = z.object({
  title: z.string().trim().min(3).max(150).openapi({ example: "Website Redesign" }),
  allowFreeSwap: z.boolean().optional().default(false),
  deadline: z.coerce.date().optional().openapi({ example: "2026-09-01T00:00:00.000Z" }),
}).strict().openapi("CreateProjectInput");

export const createProjectWithLinksSchema = z.object({
  project: createProjectSchema,
  links: z.array(createProjectLinkSchema).optional().default([]),
}).strict().openapi("CreateProjectWithLinksInput");