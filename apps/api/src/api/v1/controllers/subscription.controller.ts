import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import moment from 'moment-timezone'
import { ISubscription, ISubscriptionFilters } from '@poveroh/types'
import { buildWhere } from '../../../helpers/filter.helper'
import { MediaHelper } from '../../../helpers/media.helper'
import logger from '../../../utils/logger'
import { getParamString } from '../../../utils/request'

export class SubscriptionController {
    //POST /
    static async add(req: Request, res: Response) {
        try {
            if (!req.body) throw new Error('Data not provided')

            const parsedSubscription: Omit<ISubscription, 'id' | 'userId' | 'createdAt'> = req.body
            parsedSubscription.isEnabled = true

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/subscription/${parsedSubscription.title}`
                )
                parsedSubscription.appearanceLogoIcon = filePath
            }

            const subscription = await prisma.subscription.create({
                data: {
                    ...parsedSubscription,
                    userId: req.user.id
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
            if (!req.body) throw new Error('Data not provided')

            const parsedSubscription: Omit<ISubscription, 'id' | 'userId' | 'createdAt'> = req.body
            const id = getParamString(req.params, 'id')

            if (!id) {
                res.status(400).json({ message: 'Missing subscription ID' })
                return
            }

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/subscription/${parsedSubscription.title}`
                )
                parsedSubscription.appearanceLogoIcon = filePath
            }

            const subscription = await prisma.subscription.update({
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
            const id = getParamString(req.params, 'id')

            if (!id) {
                res.status(400).json({ message: 'Missing subscription ID' })
                return
            }

            await prisma.subscription.delete({ where: { id } })

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

            const [data, total] = await Promise.all([
                prisma.subscription.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take
                }),
                prisma.subscription.count({ where })
            ])

            res.status(200).json({ data, total })
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
