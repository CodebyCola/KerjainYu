import { db } from "../db";
import { Knex } from "knex";

export async function createNotification(
    data: {
        userId: number;
        type: string;
        referenceType?: string;
        referenceId?: number;
        message: string;
    },
    trx?: Knex.Transaction,
) {
    const executor = trx || db;
    const [notification] = await executor("notifications")
        .insert({ ...data, isRead: false })
        .returning("*");
    return notification;
}

export async function getNotificationsByUser(
    userId: number,
    options?: { unreadOnly?: boolean; limit?: number },
) {
    return db("notifications")
        .where({ userId })
        .modify((qb) => {
            if (options?.unreadOnly) {
                qb.where({ isRead: false });
            }
        })
        .orderBy("created_at", "desc")
        .limit(options?.limit ?? 50);
}

export async function getUnreadCount(userId: number) {
    const [{ count }] = await db("notifications")
        .where({ userId, isRead: false })
        .count("id as count");
    return Number(count);
}

export async function getNotificationById(id: number) {
    return db("notifications").where({ id }).first();
}

export async function markAsRead(id: number, trx?: Knex.Transaction) {
    const executor = trx || db;
    const [updated] = await executor("notifications")
        .where({ id })
        .update({ isRead: true })
        .returning("*");
    return updated;
}
export async function markAllAsRead(userId: number) {
    return db("notifications")
        .where({ userId, isRead: false })
        .update({ isRead: true });
}

export async function deleteNotification(id: number) {
    return db("notifications").where({ id }).del();
}

export async function deleteReadNotificationsOlderThan(days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return db("notifications")
        .where({ isRead: true })
        .where("created_at", "<", cutoff)
        .del();
}