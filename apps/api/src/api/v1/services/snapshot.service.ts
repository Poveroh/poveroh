import prisma from '@poveroh/prisma'
import { CreateSnapshotAccountBalanceRequest } from '@poveroh/types'
import { NotFoundError } from '@/src/utils'
import { RedisHelper } from '../helpers/redis.helper'
import { recalculateSubsequentSnapshots } from '../helpers/snapshot.helper'
import { BaseService } from './base.service'

/**
 * Service class for managing snapshots, including creating account balance snapshots for the authenticated user
 * All methods automatically retrieve the user ID from the request context.
 */
export class SnapshotService extends BaseService {
    constructor(userId: string) {
        super(userId, 'snapshot')
    }

    /**
     * Creates or updates a snapshot account balance for the authenticated user
     * @param payload The account balance snapshot data
     * @returns The full snapshot with all account balances and asset values
     */
    async addAccountBalanceSnapshot(payload: CreateSnapshotAccountBalanceRequest) {
        const userId = this.getUserId()
        const { accountId, balance, snapshotDate } = payload

        const parsedBalance = Number(balance)

        const account = await prisma.financialAccount.findFirst({
            where: { id: accountId, userId },
            select: { id: true }
        })

        if (!account) {
            throw new NotFoundError('Financial account not found')
        }

        const snapshot = await prisma.snapshot.upsert({
            where: {
                userId_snapshotDate: {
                    userId,
                    snapshotDate
                }
            },
            update: {},
            create: {
                userId,
                snapshotDate,
                totalCash: 0,
                totalInvestments: 0,
                totalNetWorth: 0
            }
        })

        await prisma.snapshotAccountBalance.upsert({
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

        await recalculateSubsequentSnapshots(accountId, snapshotDate, parsedBalance, userId)

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

        return prisma.snapshot.findUniqueOrThrow({
            where: { id: snapshot.id },
            include: {
                accountBalances: true,
                assetValues: true
            }
        })
    }
}
