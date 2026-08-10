import rateLimit from "express-rate-limit";
import { AuthRequest } from "./auth.middlewares";

// Global limiter
export const globalLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login/Register attempts
export const authLimiter = rateLimit({
  // Production: 15 * 60 * 1000
  windowMs: 10 * 1000, // Development
  max: 20,
  message: {
    success: false,
    message: "Too many attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Create project limiter
export const createLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 3,
  message: {
    success: false,
    message: "Too many project creations, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});