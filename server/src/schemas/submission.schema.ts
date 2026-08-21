import { z } from "../lib/zod-extended";


export const submissionAttachmentSchema = z.object({
    type: z.enum(["text", "image", "file", "link"])
        .openapi({ example: "link" }),
    content: z.string().trim().min(1, "Content cannot be empty")
        .openapi({ example: "https://figma.com/file/website-redesign?node=homepage" }),
}).strict().openapi("SubmissionAttachmentInput");

// ─────────────────────────────────────────────
// POST /api/v1/tasks/:id/submissions
// taskId dari URL param, submittedBy dari user yang login — TIDAK ada di body
// (prinsip yang sama dengan projectId/createdBy di createTaskSchema)
// ─────────────────────────────────────────────

export const createSubmissionSchema = z.object({
    note: z.string()
        .trim()
        .min(1, "Note cannot be empty")
        .max(1000, "Note is too long")
        .optional()
        .openapi({
            example: "Sudah selesai, mockup ada di Figma."
        }),
    attachments: z.array(submissionAttachmentSchema).max(10, "Maximum 10 attachments per submission")
        .optional().default([])
        .openapi({ description: "Optional list of links/files/images/text attached to this submission" }),
}).strict().openapi("CreateSubmissionInput");

// ─────────────────────────────────────────────
// PATCH /api/v1/submissions/:id/review
// Dipakai oleh leader untuk approve/minta revisi/reject.
// reviewedBy diambil dari user yang login, BUKAN dari body.
// ─────────────────────────────────────────────

export const reviewSubmissionSchema = z.object({
    reviewStatus: z.enum(["approved", "revision_requested", "rejected"])
        .openapi({ example: "revision_requested" }),
    reviewNote: z.string().trim().max(1000, "Review note is too long").optional()
        .openapi({ example: "Warna kurang sesuai brand guideline, tolong disesuaikan." }),
})
    .strict()
    .refine(
        (data) => {
            // reviewNote WAJIB diisi kalau statusnya bukan "approved" — member berhak tau
            // alasannya kalau kerjaannya diminta revisi atau ditolak
            if (data.reviewStatus !== "approved" && !data.reviewNote) {
                return false;
            }
            return true;
        },
        {
            message: "reviewNote is required when requesting revision or rejecting a submission",
            path: ["reviewNote"],
        }
    )
    .openapi("ReviewSubmissionInput");

export type SubmissionAttachmentInput = z.infer<typeof submissionAttachmentSchema>;
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;