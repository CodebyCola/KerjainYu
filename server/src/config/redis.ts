import Redis from "ioredis";

export const redisClient = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    enableOfflineQueue: true, // Penting untuk fail-open
    connectTimeout: 5000,
    retryStrategy(times) {
        return Math.min(times * 100, 3000);
    },
});

export const initRedis = async (): Promise<void> => {
    // Hanya panggil connect jika statusnya masih 'wait' (belum connect / connecting)
    if (redisClient.status === "wait") {
        try {
            await redisClient.connect();
            console.log("[Redis] Connected to server successfully.");
        } catch (error) {
            console.warn("[Redis] Initial connection failed. App will continue in fail-open mode.");
        }
    }
};