import { rateLimit } from "express-rate-limit";
import RedisStore, { RedisReply } from "rate-limit-redis";
import { redisClient } from "../config/redis";
import { Request, Response } from "express";

const createLimiter = (options: {
  windowMs: number;
  max: number;
  code: string;
  message: string;
  keyPrefix: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: "draft-7",
    legacyHeaders: false,

    skip: () => process.env.NODE_ENV === "test",

    store: new RedisStore({
      // Teruskan perintah secara langsung ke ioredis
      sendCommand: (...args: string[]): Promise<RedisReply> => {
        return redisClient.call(args[0], ...args.slice(1)) as Promise<RedisReply>;
      },
      prefix: `rl:${options.keyPrefix}:`,
    }),

    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: {
          code: options.code,
          message: options.message,
          httpStatus: 429,
        },
      });
    },
  });
};

export const readRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  code: "TOO_MANY_READ_REQUESTS",
  message: "Too many read requests, please try again after 15 minutes.",
  keyPrefix: "read",
});

export const writeRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  code: "TOO_MANY_WRITE_REQUESTS",
  message: "Too many write requests, please try again after 15 minutes.",
  keyPrefix: "write",
});


export const authRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  code: "TOO_MANY_AUTH_ATTEMPTS",
  message: "Too many authentication attempts, please try again after 15 minutes.",
  keyPrefix: "auth",
});