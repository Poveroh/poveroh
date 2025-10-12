import { TransactionAction } from '@poveroh/types'
import { TransactionFormProps } from '@/types/form'
import { useExpensesForm } from './use-expenses-form'
import { useIncomeForm } from './use-income-form'
import { useTransferForm } from './use-transfer-form'

export function useTransactionForm(type: TransactionAction, props: TransactionFormProps) {
    if (type === TransactionAction.EXPENSES) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useExpensesForm(props)
    }
    if (type === TransactionAction.INCOME) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useIncomeForm(props)
    }
    if (type === TransactionAction.TRANSFER) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useTransferForm(props)
    }

    throw new Error(`Unsupported transaction type: ${type}`)
}
