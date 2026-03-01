/**
 * Base class for HTTP errors
 */
export class HttpError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public details?: any
    ) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends HttpError {
    constructor(message: string = 'Bad request', details?: any) {
        super(400, message, details)
    }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends HttpError {
    constructor(message: string = 'Unauthorized', details?: any) {
        super(401, message, details)
    }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends HttpError {
    constructor(message: string = 'Forbidden', details?: any) {
        super(403, message, details)
    }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends HttpError {
    constructor(message: string = 'Resource not found', details?: any) {
        super(404, message, details)
    }
}

/**
 * 409 Conflict
 */
export class ConflictError extends HttpError {
    constructor(message: string = 'Conflict', details?: any) {
        super(409, message, details)
    }
}

/**
 * 422 Unprocessable Entity
 */
export class ValidationError extends HttpError {
    constructor(message: string = 'Validation error', details?: any) {
        super(422, message, details)
    }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends HttpError {
    constructor(message: string = 'Internal server error', details?: any) {
        super(500, message, details)
    }
}
