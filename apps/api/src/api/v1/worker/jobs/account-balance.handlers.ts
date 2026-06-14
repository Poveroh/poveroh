import type { JobHandlers } from '@poveroh/types'
import { logger } from '@poveroh/logger/server'
import { AccountBalanceService } from '../../modules/financial-accounts/account-balance/account-balance.service'

export const accountBalanceJobHandlers: JobHandlers = {
    'account-balance.materialize-daily': async payload => {
        // Snapshots each active account's live balance into its daily balance time-series.
        // It iterates per user (account access scoped by ownership) and never touches manual anchors.
        const accountBalanceService = new AccountBalanceService()
        const count = await accountBalanceService.materializeDaily(payload.date)

        logger.info('Daily account balances materialized', {
            date: payload.date ?? null,
            accounts: count
        })
    },
    'account-balance.backfill-range': async payload => {
        // Rebuilds the daily balance series of a single account from a date forward (e.g. after a backdated
        // transaction) so the historical chart and snapshots fill in the missing daily points.
        const accountBalanceService = new AccountBalanceService()
        await accountBalanceService.backfillDailySeries(
            payload.financialAccountId,
            payload.userId,
            new Date(payload.fromDate)
        )

        logger.info('Account balance series backfilled', {
            financialAccountId: payload.financialAccountId,
            fromDate: payload.fromDate
        })
    }
}
