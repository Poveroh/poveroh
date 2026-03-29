import { TransactionFormProps } from '@/types/form'
import { useExpensesForm } from './use-expenses-form'
import { useIncomeForm } from './use-income-form'
import { useTransferForm } from './use-transfer-form'
import { TransactionActionEnum } from '@poveroh/types'

export function useTransactionForm(type: TransactionActionEnum, props: TransactionFormProps) {
    if (type === 'EXPENSES') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useExpensesForm(props)
    }
    if (type === 'INCOME') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useIncomeForm(props)
    }
    if (type === 'TRANSFER') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useTransferForm(props)
    }

    throw new Error(`Unsupported transaction type: ${type}`)
}
