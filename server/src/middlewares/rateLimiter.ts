import rateLimit, { ipKeyGenerator } from 'express-rate-limit'


export const globalLimiter = rateLimit({
    windowMs: 1 * 30 * 1000, max: 100, message: { success: false, message: "Too many request" },
    standardHeaders: true,
    legacyHeaders: false,
    // keyGenerator: (req) => req.user?.id?.toString() || req.ip,
})
//Login/Register attempts
export const authLimiter = rateLimit({
    // windowMs: 15 * 30 * 1000, For Production
    windowMs: 1 * 10 * 1000, // For Development (Testing) 
    max: 3,
    message: { success: false, message: `Too many attempts, please try again later` },
    standardHeaders: true,
    legacyHeaders: false,
    // keyGenerator: (req) => req.user?.id?.toString() || req.ip,
})
