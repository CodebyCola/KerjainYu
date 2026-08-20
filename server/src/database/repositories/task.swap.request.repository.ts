import { db } from "../db";
import { Knex } from "knex";

export async function createSwapRequest(
    data: {
        taskId: number;
        targetTaskId?: number;
        requestedBy: number;
        requestedTo: number;
    },
    trx?: Knex.Transaction,
) {
    const executor = trx || db;
    const [swapRequest] = await executor("task_swap_requests")
        .insert({ ...data, status: "pending" })
        .returning("*");
    return swapRequest;
}

export async function getSwapRequestById(id: number) {
    return db("task_swap_requests").where({ id }).first();
}

export async function updateSwapRequestStatus(
    id: number,
    status: "approved" | "rejected" | "cancelled",
    resolvedBy: number | null,
    trx?: Knex.Transaction,
) {
    const executor = trx || db;
    const [updated] = await executor("task_swap_requests")
        .where({ id })
        .update({
            status,
            resolvedBy,
            resolvedAt: new Date(),
        })
        .returning("*");
    return updated;
}

// Swap request yang MASUK buat user tertentu (dia yang diminta setuju/tolak)
export async function getPendingSwapRequestsForUser(userId: number) {
    return db("task_swap_requests")
        .where({ requestedTo: userId, status: "pending" })
        .orderBy("created_at", "desc");
}

// Swap request yang DIAJUKAN oleh user tertentu (buat dia bisa lihat/cancel punya sendiri)
export async function getSwapRequestsBySender(userId: number) {
    return db("task_swap_requests")
        .where({ requestedBy: userId })
        .orderBy("created_at", "desc");
}

// Cek apakah task ini sudah punya swap request yang masih pending —
// mencegah user spam banyak request buat task yang sama
export async function getPendingSwapRequestForTask(taskId: number) {
    return db("task_swap_requests")
        .where({ taskId, status: "pending" })
        .first();
}