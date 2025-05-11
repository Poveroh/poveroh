'use client'

import { BankAccountService } from '@/services/bankaccount.service'
import { useBankAccountStore } from '@/store/bankaccount.store'
import { BankAccountType, IBankAccount, IBankAccountFilters, IItem } from '@poveroh/types'
import { useTranslations } from 'next-intl'

export const useBankAccount = () => {
    const t = useTranslations()

    const bankAccountService = new BankAccountService()

    const bankAccountStore = useBankAccountStore()

    const addBankAccount = async (data: FormData) => {
        const res = await bankAccountService.add(data)

        bankAccountStore.addBankAccount(res)

        return res
    }

    const editBankAccount = async (data: FormData) => {
        const res = await bankAccountService.save(data)

        bankAccountStore.editBankAccount(res)

        return res
    }

    const removeBankAccount = async (bankAccount_id: string) => {
        const res = await bankAccountService.delete(bankAccount_id)

        if (!res) {
            throw new Error('Error deleting bank account')
        }

        bankAccountStore.removeBankAccount(bankAccount_id)

        return res
    }

    const getBankAccount = async (bankAccount_id: string, fetchFromServer?: boolean) => {
        return fetchFromServer
            ? await bankAccountService.read<IBankAccount | null, IBankAccountFilters>({ id: bankAccount_id })
            : bankAccountStore.getBankAccount(bankAccount_id)
    }

    const fetchBankAccount = async () => {
        const res = await bankAccountService.read<IBankAccount[], IBankAccountFilters>()

        bankAccountStore.setBankAccount(res)

        return res
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
