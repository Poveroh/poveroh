'use client'

import { BankAccountService } from '@/services/bankaccount.service'
import { useBankAccountStore } from '@/store/bankaccount.store'
import { BankAccountType, IBankAccount, IBankAccountFilters } from '@poveroh/types'
import { useTranslations } from 'next-intl'
import { useError } from './useError'
import { useState } from 'react'

export const useBankAccount = () => {
    const t = useTranslations()
    const { handleError } = useError()

    const bankAccountService = new BankAccountService()
    const bankAccountStore = useBankAccountStore()

    const [loading, setLoading] = useState(false)

    const addBankAccount = async (data: FormData) => {
        try {
            const res = await bankAccountService.add(data)
            bankAccountStore.addBankAccount(res)

            return res
        } catch (error) {
            return handleError(error, 'Error adding bank account')
        }
    }

    const editBankAccount = async (id: string, data: FormData) => {
        try {
            const res = await bankAccountService.save(id, data)
            bankAccountStore.editBankAccount(res)

            return res
        } catch (error) {
            return handleError(error, 'Error editing bank account')
        }
    }

    const removeBankAccount = async (bankAccountId: string) => {
        try {
            const res = await bankAccountService.delete(bankAccountId)

            if (!res) {
                throw new Error('No response from server')
            }

            bankAccountStore.removeBankAccount(bankAccountId)

            return res
        } catch (error) {
            return handleError(error, 'Error deleting bank account')
        }
    }

    const getBankAccount = async (bankAccountId: string, fetchFromServer?: boolean) => {
        try {
            return fetchFromServer
                ? await bankAccountService.read<IBankAccount | null, IBankAccountFilters>({ id: bankAccountId })
                : bankAccountStore.getBankAccount(bankAccountId)
        } catch (error) {
            return handleError(error, 'Error fetching bank account')
        }
    }

    const fetchBankAccount = async () => {
        try {
            if (bankAccountStore.bankAccountCacheList.length > 0) {
                return bankAccountStore.bankAccountCacheList
            }

            const res = await bankAccountService.read<IBankAccount[], IBankAccountFilters>()

            bankAccountStore.setBankAccounts(res)

            return res
        } catch (error) {
            return handleError(error, 'Error fetching bank accounts')
        }
    }

    const typeList = [
        { value: BankAccountType.ONLINE_BANK, label: t('bankAccounts.types.online') },
        { value: BankAccountType.BANK_ACCOUNT, label: t('bankAccounts.types.bank') },
        { value: BankAccountType.CIRCUIT, label: t('bankAccounts.types.circuit') },
        { value: BankAccountType.DEPOSIT_BANK, label: t('bankAccounts.types.deposit') },
        { value: BankAccountType.BROKER, label: t('bankAccounts.types.broker') }
    ]

    return {
        bankAccountCacheList: bankAccountStore.bankAccountCacheList,
        addBankAccount,
        editBankAccount,
        removeBankAccount,
        getBankAccount,
        fetchBankAccount,
        typeList
    }
}
