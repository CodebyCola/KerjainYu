import { Request, Response, NextFunction } from "express"
import { ZodSchema } from "zod"

import { ValidationError } from "../errors/AppError"

export function validate(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body)
        if (!result.success) {
            const message = result.error.issues.map(e => e.message).join(',')
            return next(new ValidationError(message))
        }
        req.body = result.data
        next();
    }
}