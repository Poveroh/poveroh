'use client'

import { TransactionService } from '@/services/transaction.service'
import { useTransactionStore } from '@/store/transaction.store'
import { IItem, ITransaction, TransactionAction } from '@poveroh/types'
import { useTranslations } from 'next-intl'

export const useTransaction = () => {
    const t = useTranslations()
    const transactionService = new TransactionService()

    const transactionStore = useTransactionStore()

    const addTransaction = async (data: FormData) => {
        const res = await transactionService.add(data)

        transactionStore.addTransaction(res)

        return res
    }

    const editTransaction = async (data: FormData) => {
        const res = await transactionService.save(data)

        transactionStore.editTransaction(res)

        return res
    }

    const removeTransaction = async (transaction_id: string) => {
        const res = await transactionService.delete(transaction_id)

        if (!res) {
            throw new Error('Error deleting transaction')
        }

        transactionStore.removeTransaction(transaction_id)

        return res
    }

    const getTransaction = async (transaction_id: string, fetchFromServer?: boolean) => {
        return fetchFromServer
            ? await transactionService.read<ITransaction | null>({ id: transaction_id })
            : transactionStore.getTransaction(transaction_id)
    }

    const fetchTransaction = async () => {
        const res = await transactionService.read<ITransaction[]>()

        transactionStore.setTransaction(res)

        return res
    }

    const getActionList = (excludeInternal?: boolean): IItem[] => {
        const actionList = [
            { value: TransactionAction.INTERNAL, label: t('transactions.types.internalTransfer') },
            { value: TransactionAction.INCOME, label: t('transactions.types.income') },
            { value: TransactionAction.EXPENSES, label: t('transactions.types.expenses') }
        ]
        return excludeInternal ? actionList.filter(({ value }) => value !== TransactionAction.INTERNAL) : actionList
    }

    return {
        transactionCacheList: transactionStore.transactionCacheList,
        addTransaction,
        editTransaction,
        removeTransaction,
        getTransaction,
        fetchTransaction,
        getActionList
    }
}
