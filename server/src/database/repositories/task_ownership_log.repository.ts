import { exec } from "node:child_process";
import { db } from "../db";
import { Knex } from "knex";

export async function createTaskLogOwnership(data: { taskId: number, fromUserId?: number | null, toUserId: number, reason: string, }, trx?: Knex.Transaction) {
    const executor = trx || db
    return executor("task_ownership_log").insert(data)
}