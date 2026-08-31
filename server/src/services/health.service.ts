import { redisClient } from "../config/redis";
import { db } from "../database/db";

export interface HealthStatus {
    status: "ok" | "degraded" | "down";
    timestamp: string;
    services: {
        database: {
            status: "up" | "down";
            latencyMs?: number;
            error?: string;
        };
        redis: {
            status: "up" | "down";
            latencyMs?: number;
            error?: string;
        };
    };
}

export const checkSystemHealth = async (): Promise<HealthStatus> => {
    const health: HealthStatus = {
        status: "ok",
        timestamp: new Date().toISOString(),
        services: {
            database: { status: "down" },
            redis: { status: "down" },
        },
    };

    // 1. Check PostgreSQL (Knex)
    try {
        const startDb = Date.now();
        await db.raw("SELECT 1");
        health.services.database = {
            status: "up",
            latencyMs: Date.now() - startDb,
        };
    } catch (err: any) {
        health.services.database = {
            status: "down",
            error: err.message,
        };
        health.status = "down";
    }

    // 2. Redis Check
    try {
        const startRedis = Date.now();
        const pingResult = await redisClient.ping();

        if (pingResult === "PONG") {
            health.services.redis = {
                status: "up",
                latencyMs: Date.now() - startRedis,
            };
        } else {
            throw new Error("Unexpected PING response");
        }
    } catch (err: any) {
        health.services.redis = {
            status: "down",
            error: err.message,
        };

        // If DB up but the redis server is down, app status still considered 'degreed'
        if (health.status !== "down") {
            health.status = "degraded";
        }
    }

    return health;
};