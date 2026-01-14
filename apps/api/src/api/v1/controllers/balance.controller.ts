import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import logger from '@/src/utils/logger'

export class BalanceController {
    static async getTotalBalance(req: Request, res: Response) {
        try {
            const userId = req.user?.id

            const accounts = await prisma.financialAccount.findMany({
                where: { userId: userId },
                select: { balance: true }
            })

            const totalBalance = accounts.reduce((sum: number, account) => {
                const amountValue = parseFloat(account.balance.toString())
                return sum + amountValue
            }, 0)

            res.json({ totalBalance })
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async getReports(req: Request, res: Response) {
        try {
            const userId = req.user?.id

            const [incomeTotal, expenseTotal] = await Promise.all([
                prisma.amount.aggregate({
                    where: { transaction: { userId }, action: 'INCOME' },
                    _sum: { amount: true }
                }),
                prisma.amount.aggregate({
                    where: { transaction: { userId }, action: 'EXPENSES' },
                    _sum: { amount: true }
                })
            ])

            const reports = {
                totalIncome: parseFloat(incomeTotal._sum.amount?.toString() || '0'),
                totalExpense: parseFloat(expenseTotal._sum.amount?.toString() || '0'),
                netBalance:
                    parseFloat(incomeTotal._sum.amount?.toString() || '0') -
                    parseFloat(expenseTotal._sum.amount?.toString() || '0'),
                categoryBreakdown: []
            }

            res.json({ reports })
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
