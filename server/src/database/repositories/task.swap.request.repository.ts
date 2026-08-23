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

// Cek apakah task ini sudah punya swap request yang masih pending —
// mencegah user spam banyak request buat task yang sama
export async function getPendingSwapRequestForTask(taskId: number) {
    return db("task_swap_requests")
        .where({ taskId, status: "pending" })
        .first();
}

// Select fields bersama buat query list (incoming/outgoing) — di-join ke
// tasks (task yang ditawarkan & task penukar) dan users (pengaju & penerima)
// biar frontend nggak perlu N+1 fetch.
function selectSwapRequestListColumns(qb: Knex.QueryBuilder) {
    return qb
        .leftJoin("tasks as offered_task", "offered_task.id", "task_swap_requests.task_id")
        .leftJoin("tasks as target_task", "target_task.id", "task_swap_requests.target_task_id")
        .leftJoin("users as sender", "sender.id", "task_swap_requests.requested_by")
        .leftJoin("users as receiver", "receiver.id", "task_swap_requests.requested_to")
        .select([
            "task_swap_requests.id",
            "task_swap_requests.status",
            "task_swap_requests.created_at",
            "task_swap_requests.resolved_at",
            "task_swap_requests.resolved_by",
            db.raw('"offered_task"."id" as "taskId"'),
            db.raw('"offered_task"."title" as "taskTitle"'),
            db.raw('"offered_task"."project_id" as "taskProjectId"'),
            db.raw('"target_task"."id" as "targetTaskId"'),
            db.raw('"target_task"."title" as "targetTaskTitle"'),
            db.raw('"sender"."id" as "requestedById"'),
            db.raw('"sender"."username" as "requestedByUsername"'),
            db.raw('"receiver"."id" as "requestedToId"'),
            db.raw('"receiver"."username" as "requestedToUsername"'),
        ])
        .orderBy("task_swap_requests.created_at", "desc");
}

// Swap request MASUK yang masih pending buat user tertentu (dia yang diminta
// setuju/tolak) — dipakai buat notifikasi "ada permintaan tukar task menunggumu"
export async function getIncomingSwapRequestsForUser(userId: number) {
    return selectSwapRequestListColumns(
        db("task_swap_requests")
            .where("task_swap_requests.requested_to", userId)
            .andWhere("task_swap_requests.status", "pending"),
    );
}

// Semua swap request yang DIAJUKAN oleh user tertentu, apapun statusnya —
// buat dia bisa lihat riwayat & cancel yang masih pending
export async function getOutgoingSwapRequestsForUser(userId: number) {
    return selectSwapRequestListColumns(
        db("task_swap_requests").where("task_swap_requests.requested_by", userId),
    );
}