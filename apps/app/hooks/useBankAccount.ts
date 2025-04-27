'use client'

import { BankAccountService } from '@/services/bankaccount.service'
import { useBankAccountStore } from '@/store/bankaccount.store'
import { IBankAccount } from '@poveroh/types'

export const useBankAccount = () => {
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
            ? await bankAccountService.read<IBankAccount | null>({ id: bankAccount_id })
            : bankAccountStore.getBankAccount(bankAccount_id)
    }

    const fetchBankAccount = async () => {
        const res = await bankAccountService.read<IBankAccount[]>()

        bankAccountStore.setBankAccount(res)

        return res
    }

    return {
        bankAccountCacheList: bankAccountStore.bankAccountCacheList,
        addBankAccount,
        editBankAccount,
        removeBankAccount,
        getBankAccount,
        fetchBankAccount
    }
}
