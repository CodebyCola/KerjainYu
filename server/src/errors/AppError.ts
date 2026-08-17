export class AppError extends Error {
    code: string;
    httpStatus: number;

    constructor(code: string, message: string, httpStatus: number) {
        super(message)
        this.code = code
        this.httpStatus = httpStatus
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not Found') {
        super('NOT_FOUND', message, 404)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Login First') {
        super('UNAUTHORIZED', message, 401)
    }
}
export class ForbiddenError extends AppError {
    constructor(message = 'You have no right to access this action/feature') {
        super('FORBIDDEN', message, 403)
    }
}
export class ValidationError extends AppError {
    fields?: Record<string, string>
    constructor(message = 'Input is not valid', fields?: Record<string, string>) {
        super('VALIDATION_ERROR', message, 400)
        this.fields = fields
    }
}
export class ConflictError extends AppError {
    constructor(message = 'Something wrong') {
        super('CONFLICT', message, 409)
    }
}
