'use client'

import { BankAccountService } from '@/services/bankaccount.service'
import { useBankAccountStore } from '@/store/bankaccount.store'
import { BankAccountType, IBankAccount, IBankAccountFilters } from '@poveroh/types'
import { useTranslations } from 'next-intl'
import { useError } from './useError'
import { useState } from 'react'

type AccountLoadingState = {
    add: boolean
    edit: boolean
    remove: boolean
    get: boolean
    fetch: boolean
}

export const useBankAccount = () => {
    const t = useTranslations()
    const { handleError } = useError()

    const bankAccountService = new BankAccountService()
    const bankAccountStore = useBankAccountStore()

    const [accountLoading, setAccountLoading] = useState<AccountLoadingState>({
        add: false,
        edit: false,
        remove: false,
        get: false,
        fetch: false
    })

    const setAccountLoadingFor = (key: keyof AccountLoadingState, value: boolean) => {
        setAccountLoading(prev => ({ ...prev, [key]: value }))
    }

    const addBankAccount = async (data: FormData) => {
        setAccountLoadingFor('add', true)
        try {
            const res = await bankAccountService.add(data)
            bankAccountStore.addBankAccount(res)
            return res
        } catch (error) {
            return handleError(error, 'Error adding bank account')
        } finally {
            setAccountLoadingFor('add', false)
        }
    }

    const editBankAccount = async (id: string, data: FormData) => {
        setAccountLoadingFor('edit', true)
        try {
            const res = await bankAccountService.save(id, data)
            bankAccountStore.editBankAccount(res)
            return res
        } catch (error) {
            return handleError(error, 'Error editing bank account')
        } finally {
            setAccountLoadingFor('edit', false)
        }
    }

    const removeBankAccount = async (bankAccountId: string) => {
        setAccountLoadingFor('remove', true)
        try {
            const res = await bankAccountService.delete(bankAccountId)
            if (!res) throw new Error('No response from server')
            bankAccountStore.removeBankAccount(bankAccountId)
            return res
        } catch (error) {
            return handleError(error, 'Error deleting bank account')
        } finally {
            setAccountLoadingFor('remove', false)
        }
    }

    const getBankAccount = async (bankAccountId: string, fetchFromServer?: boolean) => {
        setAccountLoadingFor('get', true)
        try {
            return fetchFromServer
                ? await bankAccountService.read<IBankAccount | null, IBankAccountFilters>({ id: bankAccountId })
                : bankAccountStore.getBankAccount(bankAccountId)
        } catch (error) {
            return handleError(error, 'Error fetching bank account')
        } finally {
            setAccountLoadingFor('get', false)
        }
    }

    const fetchBankAccount = async (forceRefresh = false) => {
        setAccountLoadingFor('fetch', true)
        try {
            if (bankAccountStore.bankAccountCacheList.length > 0 && !forceRefresh) {
                return bankAccountStore.bankAccountCacheList
            }
            const res = await bankAccountService.read<IBankAccount[], IBankAccountFilters>()
            bankAccountStore.setBankAccounts(res)
            return res
        } catch (error) {
            return handleError(error, 'Error fetching bank accounts')
        } finally {
            setAccountLoadingFor('fetch', false)
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
        accountLoading,
        addBankAccount,
        editBankAccount,
        removeBankAccount,
        getBankAccount,
        fetchBankAccount,
        typeList
    }
}
