import { z } from "../lib/zod-extended";

// POST /api/v1/tasks/:id/swap-requests
export const createSwapRequestSchema = z.object({
    targetTaskId: z.coerce.number().int().positive().optional()
        .openapi({ example: 12, description: "Task milik requestedTo yang ingin ditukar (opsional — kosongkan untuk swap satu arah)" }),
    requestedTo: z.coerce.number().int().positive()
        .openapi({ example: 7, description: "userId member yang diminta menyetujui swap ini" }),
}).strict().openapi("CreateSwapRequestInput");

// PATCH /api/v1/swap-requests/:id/respond
// Dipakai oleh requestedTo (menyetujui/menolak tawaran) ATAU leader
// (jika project.allowFreeSwap = false, butuh approval leader)
export const respondSwapRequestSchema = z.object({
    status: z.enum(["approved", "rejected"]),
}).strict().openapi("RespondSwapRequestInput");

export type CreateSwapRequestInput = z.infer<typeof createSwapRequestSchema>;
export type RespondSwapRequestInput = z.infer<typeof respondSwapRequestSchema>;