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

const notInThePast = (date: Date) => date.getTime() >= Date.now() - 60_000; // 60s clock-skew tolerance

const deadlineSchema = z.coerce
  .date()
  .refine(notInThePast, { message: "Deadline cannot be in the past" });

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

    deadline: deadlineSchema.optional().openapi({
      example: "2026-09-20T00:00:00.000Z",
    }),

  })
  .strict()
  .openapi("CreateTaskInput");

export const updateTaskSchema = z
  .object({
    title: z.string(),

    description: z.string(),

    priority: z.int(),

    deadline: deadlineSchema,
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
