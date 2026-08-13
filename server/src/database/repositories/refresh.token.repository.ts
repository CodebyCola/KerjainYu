import { db } from "../db";
import { Knex } from "knex";

export async function createRefreshToken(userId: number, data: { tokenHash: string, deviceInfo?: string, ipAddress?: string, isRevoked?: boolean, expiresAt: Date }, trx?: Knex.Transaction) {
    const executor = trx || db
    const [row] = await executor("refresh_tokens").insert({
        user_id: userId,
        token_hash: data.tokenHash,
        device_info: data.deviceInfo || "Unknown Device",
        ip_address: data.ipAddress,
        is_revoked: data.isRevoked ?? false,
        expires_at: data.expiresAt,
    }).returning('id');

    return row.id
}

export async function findByHash(tokenHash: string) {
    return await db("refresh_tokens").where("token_hash", tokenHash).first()
}
export async function revokeByHash(tokenHash: string, trx?: Knex.Transaction) {
    const executor = trx || db
    const [row] = await executor("refresh_tokens").where("token_hash", tokenHash).update("is_revoked", true).returning('*')
    return row
}

