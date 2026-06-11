import type { AccountSummaryData } from '@poveroh/types'
import { NotFoundError } from '@/utils'
import { BaseService } from '../../base/base.service'
import { AccountSummaryRepository } from './account-summary.repository'
import { FinancialAccountRepository } from '../financial-account.repository'

export class AccountSummaryService extends BaseService {
    private readonly accountSummaryRepository = new AccountSummaryRepository()
    private readonly financialAccountRepository = new FinancialAccountRepository()

    constructor() {
        super('account-summary')
    }

    /**
     * Computes the period summary (income, expenses, transaction count) of a financial account owned by the current user within an optional date range.
     * @param financialAccountId The financial account whose summary is requested.
     * @param from An optional inclusive lower bound date (ISO string).
     * @param to An optional inclusive upper bound date (ISO string).
     * @returns A promise resolving to the aggregated period summary used by the detail page KPIs.
     */
    async getSummary(financialAccountId: string, from?: string, to?: string): Promise<AccountSummaryData> {
        const userId = this.context.currentUser.id

        const account = await this.financialAccountRepository.findById(userId, financialAccountId)
        if (!account) {
            throw new NotFoundError('Financial account not found')
        }

        const totals = await this.accountSummaryRepository.getSummary(
            financialAccountId,
            userId,
            from ? new Date(from) : undefined,
            to ? new Date(to) : undefined
        )

        return { ...totals, from: from ?? null, to: to ?? null }
    }
}
