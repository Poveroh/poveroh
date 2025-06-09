import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { ISubscription, ISubscriptionBase, ISubscriptionFilters } from '@poveroh/types'
import { buildWhere } from '../../../helpers/filter.helper'
import { MediaHelper } from '../../../helpers/media.helper'
import logger from '../../../utils/logger'

export class SubscriptionController {
    //POST /
    static async add(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            const parsedSubscription: ISubscriptionBase = JSON.parse(req.body.data)
            parsedSubscription.is_enabled = true

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/subscription/${parsedSubscription.title}`
                )
                parsedSubscription.appearance_logo_icon = filePath
            }

            const subscription = await prisma.subscriptions.create({
                data: {
                    ...parsedSubscription,
                    user_id: req.user.id
                }
            })

            res.status(200).json(subscription)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //POST /:id
    static async save(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            const parsedSubscription: ISubscription = JSON.parse(req.body.data)
            const { id } = req.params

            if (!id) {
                res.status(400).json({ message: 'Missing subscription ID' })
                return
            }

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/subscription/${parsedSubscription.title}`
                )
                parsedSubscription.appearance_logo_icon = filePath
            }

            const subscription = await prisma.subscriptions.update({
                where: { id },
                data: parsedSubscription
            })

            res.status(200).json(subscription)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //DELETE /:id
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params

            if (!id) {
                res.status(400).json({ message: 'Missing subscription ID' })
                return
            }

            await prisma.subscriptions.delete({ where: { id } })

            res.status(200).json(true)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //GET /
    static async read(req: Request, res: Response) {
        try {
            const filters = req.query as unknown as ISubscriptionFilters
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const where = buildWhere(filters)

            const data = await prisma.subscriptions.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip,
                take
            })

            res.status(200).json(data)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
