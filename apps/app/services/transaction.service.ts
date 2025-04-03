import { IItem, ITransaction, TransactionAction } from '@poveroh/types'
import { BaseService } from './base.service'

export class TransactionService extends BaseService<ITransaction> {
    constructor() {
        super('/transaction')
    }

    getActionList(t: (key: string) => string, excludeInternal?: boolean): IItem[] {
        const actionList = [
            { value: TransactionAction.INTERNAL, label: t('transactions.types.internalTransfer') },
            { value: TransactionAction.INCOME, label: t('transactions.types.income') },
            { value: TransactionAction.EXPENSES, label: t('transactions.types.expenses') }
        ]
        return excludeInternal ? actionList.filter(({ value }) => value !== TransactionAction.INTERNAL) : actionList
    }
}
