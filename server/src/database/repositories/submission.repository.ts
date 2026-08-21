import { db } from "../db";
import { Knex } from "knex";
import { CreateSubmissionInput } from "../../schemas/submission.schema";

// ─────────────────────────────────────────────
// task_submissions
// ─────────────────────────────────────────────

export async function createSubmission(
    data: {
        taskId: number;
        submittedBy: number;
        note?: string;
    },
    trx?: Knex.Transaction,
) {
    const executor = trx || db;
    const [submission] = await executor("task_submissions")
        .insert(data)
        .returning("*");
    return submission;
}

export async function createSubmissionWithAttachments(
    taskId: number,
    submittedBy: number,
    input: CreateSubmissionInput,
    trx: Knex.Transaction,
) {
    const executor = trx;

    const submission = await createSubmission(
        {
            taskId,
            submittedBy,
            note: input.note,
        },
        executor,
    );

    if (input.attachments.length > 0) {
        await createAttachments(
            input.attachments.map((attachment) => ({
                ...attachment,
                submissionId: submission.id,
            })),
            executor,
        );
    }

    return submission;
}

export async function getSubmissionById(id: number) {
    return db("task_submissions").where({ id }).first();
}

export async function getSubmissionsByTask(taskId: number) {
    return db("task_submissions")
        .where({ taskId })
        .orderBy("submitted_at", "desc");
}

// Submission yang MASIH PENDING milik project tertentu — berguna untuk
// leader lihat "apa saja yang perlu saya review" tanpa harus buka tiap task satu-satu
export async function getPendingSubmissionsByProject(projectId: number) {
    return db("task_submissions")
        .join("tasks", "tasks.id", "task_submissions.task_id")
        .where("tasks.project_id", projectId)
        .where("task_submissions.review_status", "pending")
        .select("task_submissions.*", "tasks.title as task_title")
        .orderBy("task_submissions.submitted_at", "asc");
}

export async function reviewSubmission(
    id: number,
    data: {
        reviewStatus: "approved" | "revision_requested" | "rejected";
        reviewNote?: string;
        reviewedBy: number;
    },
    trx?: Knex.Transaction,
) {
    const executor = trx || db;
    const [updated] = await executor("task_submissions")
        .where({ id }).whereIn("review_status", ["pending", "revision_requested"])
        .update({
            reviewStatus: data.reviewStatus,
            reviewNote: data.reviewNote ?? null,
            reviewedBy: data.reviewedBy,
            reviewedAt: new Date(),
        })
        .returning("*");
    return updated;
}

// ─────────────────────────────────────────────
// submission_attachments
// ─────────────────────────────────────────────

export async function createAttachments(
    attachments: Array<{ submissionId: number; type: string; content: string }>,
    trx?: Knex.Transaction,
) {
    const executor = trx || db;
    return executor("submission_attachments").insert(attachments).returning("*");
}

export async function getAttachmentsBySubmission(submissionId: number) {
    return db("submission_attachments").where({ submissionId });
}