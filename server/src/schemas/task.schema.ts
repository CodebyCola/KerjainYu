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

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .nonempty("Title must be filled")
      .openapi({ example: "Buat testing aplikasi" }),

    description: z.string().optional().openapi({
      example: "Buatin testing aplikasi untuk feature berikut ...",
    }),

    status: taskStatusSchema.optional().default("unclaimed"),

    priority: z.int().optional().openapi({ example: 1 }),

    isClaimable: z
      .boolean()
      .optional()
      .default(true)
      .openapi({ example: true }),
    deadline: z.coerce.date().optional().openapi({
      example: "2026-09-20T00:00:00.000Z",
    }),

  })
  .strict()
  .openapi("CreateTaskInput");

export const updateTaskSchema = z
  .object({
    title: z.string(),

    description: z.string(),

    status: taskStatusSchema,

    priority: z.int(),

    deadline: z.coerce.date(),
  })
  .partial()
  .strict()
  .refine(
    (data) => {
      const keys = Object.keys(data);
      return keys.length > 0;
    },
    {
      message: "At least one field must be provided to update",
    },
  )
  .openapi("UpdateTaskInput");


export type TaskStatusSchema = z.infer<typeof taskStatusSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTasktInput = z.infer<typeof updateTaskSchema>;
