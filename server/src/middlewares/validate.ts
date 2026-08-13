import { Request, Response, NextFunction } from "express"
import { ZodSchema } from "zod"

import { ValidationError } from "../errors/AppError"

type ValidateSource = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, source: ValidateSource = 'body') {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source])
        if (!result.success) {
            const fields: Record<string, string> = {};
            result.error.issues.forEach((e) => {
                const key = e.path.join('.') || source;
                fields[key] = e.message;
            });
            const message = result.error.issues.map(e => e.message).join(', ')
            return next(new ValidationError(message, fields))
        }
        if (source === 'body') {
            req.body = result.data
        } else {
            Object.assign(req[source], result.data)
        }
        next();
    }
}