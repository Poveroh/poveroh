import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { ISubscription, ISubscriptionBase, ISubscriptionFilters } from '@poveroh/types'
import { buildWhere } from '../helpers/filter.helper'

export class SubscriptionController {
    static async add(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            let parsedSubscription: ISubscriptionBase = JSON.parse(req.body.data)

            parsedSubscription.is_enabled = true

            const subscription = await prisma.subscriptions.create({
                data: {
                    ...parsedSubscription,
                    user_id: req.user.id
                }
            })

            res.status(200).json(subscription)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async save(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            let parsedSubscription: ISubscription = JSON.parse(req.body.data)

            const subscription = await prisma.subscriptions.update({
                where: {
                    id: parsedSubscription.id
                },
                data: {
                    ...parsedSubscription
                    // icon: parsedSubscription.icon
                }
            })

            res.status(200).json(subscription)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params

            await prisma.subscriptions.delete({
                where: { id }
            })

            res.status(200).json(true)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async read(req: Request, res: Response) {
        try {
            const filters: ISubscriptionFilters | string[] = req.body
            const where = buildWhere(filters)

            const data = await prisma.subscriptions.findMany({
                where,
                orderBy: { created_at: 'desc' }
            })

            res.status(200).json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
