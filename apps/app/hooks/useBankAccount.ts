'use client'

import { BankAccountService } from '@/services/bankaccount.service'
import { useBankAccountStore } from '@/store/bankaccount.store'
import { BankAccountType, IBankAccount, IBankAccountFilters, IItem } from '@poveroh/types'
import { useTranslations } from 'next-intl'
import { useError } from './useError'

export const useBankAccount = () => {
    const t = useTranslations()
    const { handleError } = useError()

    const bankAccountService = new BankAccountService()
    const bankAccountStore = useBankAccountStore()

    const addBankAccount = async (data: FormData) => {
        try {
            const res = await bankAccountService.add(data)
            bankAccountStore.addBankAccount(res)

            return res
        } catch (error) {
            return handleError(error, 'Error adding bank account')
        }
    }

    const editBankAccount = async (data: FormData) => {
        try {
            const res = await bankAccountService.save(data)
            bankAccountStore.editBankAccount(res)

            return res
        } catch (error) {
            return handleError(error, 'Error editing bank account')
        }
    }

    const removeBankAccount = async (bankAccount_id: string) => {
        try {
            const res = await bankAccountService.delete(bankAccount_id)

            if (!res) {
                throw new Error('No response from server')
            }

            bankAccountStore.removeBankAccount(bankAccount_id)

            return res
        } catch (error) {
            return handleError(error, 'Error deleting bank account')
        }
    }

    const getBankAccount = async (bankAccount_id: string, fetchFromServer?: boolean) => {
        try {
            return fetchFromServer
                ? await bankAccountService.read<IBankAccount | null, IBankAccountFilters>({ id: bankAccount_id })
                : bankAccountStore.getBankAccount(bankAccount_id)
        } catch (error) {
            return handleError(error, 'Error fetching bank account')
        }
    }

    const fetchBankAccount = async () => {
        try {
            const res = await bankAccountService.read<IBankAccount[], IBankAccountFilters>()
            bankAccountStore.setBankAccount(res)

            return res
        } catch (error) {
            return handleError(error, 'Error fetching bank accounts')
        }
    }

    const getTypeList = (): IItem[] => {
        return [
            { value: BankAccountType.ONLINE_BANK, label: t('bankAccounts.types.online') },
            { value: BankAccountType.BANK_ACCOUNT, label: t('bankAccounts.types.bank') },
            { value: BankAccountType.CIRCUIT, label: t('bankAccounts.types.circuit') },
            { value: BankAccountType.DEPOSIT_BANK, label: t('bankAccounts.types.deposit') },
            { value: BankAccountType.BROKER, label: t('bankAccounts.types.broker') }
        ]
    }

    return {
        bankAccountCacheList: bankAccountStore.bankAccountCacheList,
        addBankAccount,
        editBankAccount,
        removeBankAccount,
        getBankAccount,
        fetchBankAccount,
        getTypeList
    }
}
