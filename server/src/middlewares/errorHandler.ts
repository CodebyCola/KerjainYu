import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError) {
        return res.status(err.httpStatus).json({ success: false, error: { code: err.code, message: err.message, httpStatus: err.httpStatus } })
    }
    console.error("🔴 UNCAUGHT ERROR:", err);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan pada server', httpStatus: 500 } })
}