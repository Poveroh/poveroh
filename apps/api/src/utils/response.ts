import { Response } from 'express'
import { HttpError } from './errors'
import { ApiResponseOptions } from '@/types/response'
import logger from './logger'

export class ResponseHelper {
    /**
     * Send a successful response (200)
     */
    static success<T = any>(res: Response, data?: T, message?: string): Response {
        return res.status(200).json({
            success: true,
            ...(message && { message }),
            ...(data && { data })
        })
    }

    /**
     * Send a created response (201)
     */
    static created<T = any>(res: Response, data: T, message?: string): Response {
        return res.status(201).json({
            success: true,
            message: message || 'Resource created successfully',
            data
        })
    }

    /**
     * Send a no content response (204)
     */
    static noContent(res: Response): Response {
        return res.status(204).send()
    }

    /**
     * Send a bad request error (400)
     */
    static badRequest(res: Response, message: string, error?: any): Response {
        return res.status(400).json({
            success: false,
            message,
            ...(error && { error })
        })
    }

    /**
     * Send an unauthorized error (401)
     */
    static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
        return res.status(401).json({
            success: false,
            message
        })
    }

    /**
     * Send a forbidden error (403)
     */
    static forbidden(res: Response, message: string = 'Forbidden'): Response {
        return res.status(403).json({
            success: false,
            message
        })
    }

    /**
     * Send a not found error (404)
     */
    static notFound(res: Response, message: string = 'Resource not found'): Response {
        return res.status(404).json({
            success: false,
            message
        })
    }

    /**
     * Send a conflict error (409)
     */
    static conflict(res: Response, message: string, error?: any): Response {
        return res.status(409).json({
            success: false,
            message,
            ...(error && { error })
        })
    }

    /**
     * Send an internal server error (500)
     */
    static serverError(res: Response, message: string = 'Internal server error', error?: any): Response {
        return res.status(500).json({
            success: false,
            message,
            ...(error && { error })
        })
    }

    /**
     * Send a custom status response
     */
    static custom<T = any>(res: Response, statusCode: number, options: ApiResponseOptions<T>): Response {
        const { data, message, error } = options
        return res.status(statusCode).json({
            success: statusCode >= 200 && statusCode < 300,
            ...(message && { message }),
            ...(data && { data }),
            ...(error && { error })
        })
    }

    /**
     * Handle error automatically based on error type
     * Use this in catch blocks to automatically handle HttpError instances
     */
    static handleError(res: Response, error: any): Response {
        logger.error(error)

        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                ...(error.details && { error: error.details })
            })
        }

        return this.serverError(res, 'An unexpected error occurred', error)
    }
}
