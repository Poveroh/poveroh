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
    }
}
