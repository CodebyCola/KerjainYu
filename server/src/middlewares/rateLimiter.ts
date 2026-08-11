import rateLimit from "express-rate-limit";
import { AuthRequest } from "./auth.middlewares";
import { Request, Response, NextFunction } from 'express';

const noopMiddleware = (req: Request, res: Response, next: NextFunction) => next();

// Global limiter
export const globalLimiter = process.env.NODE_ENV === 'test'
  ? noopMiddleware
  : rateLimit({
    windowMs: 30 * 1000,
    max: 500,
    message: {
      success: false,
      message: "Too many requests",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

// Login/Register attempts
export const authLimiter = process.env.NODE_ENV === 'test'
  ? noopMiddleware
  : rateLimit({
    // Production: 15 * 60 * 1000
    windowMs: 10 * 1000, // Development
    max: 100,
    message: {
      success: false,
      message: "Too many attempts, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

// Create project limiter
export const createLimiter = process.env.NODE_ENV === 'test'
  ? noopMiddleware
  : rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: 500,
    message: {
      success: false,
      message: "Too many project creations, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });