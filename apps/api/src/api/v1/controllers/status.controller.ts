import { Request, Response } from 'express'

export class StatusController {
    static async isAlive(req: Request, res: Response) {
        try {
            res.json({
                status: 'ok',
                uptime: process.uptime(),
                version: 'v1',
                timestamp: new Date()
            })
        } catch (error: any) {
            console.log(error)
            res.status(500).json({
                message: 'An error occurred during login',
                error: error.message
            })
        }
    }
}
