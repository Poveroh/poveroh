import prisma from '@poveroh/prisma'
import { IAmount, IAmountBase, TransactionAction } from '@poveroh/types'
import { Decimal } from '@prisma/client/runtime/library'
import { RedisHelper } from './redis.helper'

export const BalanceHelper = {
    getAccountBalance: async (financialAccountId: string) => {
        // Try to get from cache first
        const cachedBalance = await RedisHelper.get(`balance:${financialAccountId}`)
        if (cachedBalance) {
            return new Decimal(cachedBalance)
        }

        // If not in cache, get from DB
        const account = await prisma.financialAccount.findUnique({
            where: { id: financialAccountId },
            select: { balance: true }
        })
        const balance = account?.balance

        if (!balance) throw new Error('Account balance not found')

        const decimalBalance = new Decimal(balance)

        // Cache the balance for 5 minutes
        await RedisHelper.set(`balance:${financialAccountId}`, decimalBalance.toString(), 300)

        return decimalBalance
    },
    updateAccountBalances: async (amount: IAmountBase, originalAmount?: number) => {
        const currentBalance = await BalanceHelper.getAccountBalance(amount.financialAccountId)

        let newBalance = new Decimal(currentBalance)

        // If originalAmount exists, revert it first
        if (originalAmount !== undefined) {
            if (amount.action === TransactionAction.INCOME) {
                newBalance = newBalance.sub(new Decimal(originalAmount))
            } else if (amount.action === TransactionAction.EXPENSES) {
                newBalance = newBalance.add(new Decimal(originalAmount))
            }
        }

        // Apply the new amount
        if (amount.action === TransactionAction.INCOME) {
            newBalance = newBalance.add(new Decimal(amount.amount))
        } else if (amount.action === TransactionAction.EXPENSES) {
            newBalance = newBalance.sub(new Decimal(amount.amount))
        }

        await prisma.financialAccount.update({
            where: { id: amount.financialAccountId },
            data: { balance: newBalance }
        })

        await RedisHelper.set(`balance:${amount.financialAccountId}`, newBalance.toString())
    },
    calculateBalance(accountId: string) {}
}
