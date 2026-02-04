import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import moment from 'moment-timezone'
import logger from '../../../utils/logger'
import { getParamString } from '../../../utils/request'
import { RedisHelper } from '../helpers/redis.helper'
import { recalculateSubsequentSnapshots } from '../helpers/snapshot.helper'

export class SnapshotController {
    // POST /snapshot/account-balance
    static async addAccountBalanceSnapshot(req: Request, res: Response) {
        try {
            const accountId = getParamString(req.body, 'accountId')

            if (!accountId) {
                res.status(400).json({ message: 'Missing financial account ID' })
                return
            }

            const { balance, snapshotDate, note } = req.body || {}

            if (balance === undefined || snapshotDate === undefined) {
                res.status(400).json({ message: 'Missing balance or snapshotDate' })
                return
            }

            const parsedBalance = Number(balance)
            if (Number.isNaN(parsedBalance)) {
                res.status(400).json({ message: 'Invalid balance value' })
                return
            }

            const account = await prisma.financialAccount.findFirst({
                where: { id: accountId, userId: req.user.id },
                select: { id: true }
            })

            if (!account) {
                res.status(404).json({ message: 'Financial account not found' })
                return
            }

            const snapshot = await prisma.snapshot.upsert({
                where: {
                    userId_snapshotDate: {
                        userId: req.user.id,
                        snapshotDate: snapshotDate
                    }
                },
                update: note !== undefined ? { note } : {},
                create: {
                    userId: req.user.id,
                    snapshotDate: snapshotDate,
                    note: note ?? null,
                    totalCash: 0,
                    totalInvestments: 0,
                    totalNetWorth: 0
                }
            })

            const accountBalance = await prisma.snapshotAccountBalance.upsert({
                where: {
                    snapshotId_accountId: {
                        snapshotId: snapshot.id,
                        accountId
                    }
                },
                update: { balance: parsedBalance },
                create: {
                    snapshotId: snapshot.id,
                    accountId,
                    balance: parsedBalance
                }
            })

            const aggregate = await prisma.snapshotAccountBalance.aggregate({
                where: { snapshotId: snapshot.id },
                _sum: { balance: true }
            })

            const totalCash = aggregate._sum.balance ?? 0

            await prisma.snapshot.update({
                where: { id: snapshot.id },
                data: {
                    totalCash,
                    totalInvestments: 0,
                    totalNetWorth: totalCash
                }
            })

            // Recalculate the balances of subsequent snapshots for this account
            await recalculateSubsequentSnapshots(accountId, snapshotDate, parsedBalance, req.user.id)

            const latestSnapshot = await prisma.snapshotAccountBalance.findFirst({
                where: { accountId },
                include: { snapshot: { select: { snapshotDate: true } } },
                orderBy: { snapshot: { snapshotDate: 'desc' } }
            })

            if (latestSnapshot?.snapshot.snapshotDate.getTime() === new Date(snapshotDate).getTime()) {
                await prisma.financialAccount.update({
                    where: { id: accountId },
                    data: { balance: parsedBalance }
                })
                await RedisHelper.delete(`balance:${accountId}`)
            }

            res.status(200).json({ snapshot, accountBalance })
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
