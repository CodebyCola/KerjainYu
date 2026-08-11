import { z } from "../lib/zod-extended";

const taskStatusSchema = z.enum([
  "unclaimed",
  "todo",
  "ongoing",
  "submitted",
  "in_revision",
  "approved",
  "rejected",
]);

export const createTaskSchema = z.object({
  title: z
    .string()
    .nonempty("Title must be filled")
    .openapi({ example: "Buat testing aplikasi" }),

  description: z.string().openapi({
    example: "Buatin testing aplikasi untuk feature berikut ...",
  }),

  status: taskStatusSchema.nonoptional().default("unclaimed"),

  priority: z.int().optional().openapi({ example: 1 }),

  displayOrder: z.int().optional().openapi({ example: 0 }),

  deadline: z.date().optional().openapi({
    example: "2026-09-20T00:00:00.000Z",
  }),
});

export const updateTaskSchema = z.object({
  title: z.string().nonempty("Title must be filled").optional(),

  description: z.string().optional(),

  status: taskStatusSchema.optional(),

  priority: z.int().optional(),

  displayOrder: z.int().optional(),

  deadline: z.date().optional(),
});


export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTasktInput = z.infer<typeof updateTaskSchema>;
