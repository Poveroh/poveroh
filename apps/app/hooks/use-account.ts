'use client'

import { AccountService } from '@/services/account.service'
import { useAccountStore } from '@/store/account.store'
import { FinancialAccountType, IFinancialAccount, IFinancialAccountFilters } from '@poveroh/types'
import { useTranslations } from 'next-intl'
import { useError } from './use-error'
import { useState } from 'react'
import { LoadingState } from '@/types/general'

export const useAccount = () => {
    const t = useTranslations()
    const { handleError } = useError()

    const accountService = new AccountService()
    const accountStore = useAccountStore()

    const [accountLoading, setAccountLoading] = useState<LoadingState>({
        add: false,
        edit: false,
        remove: false,
        get: false,
        fetch: false
    })

    const setAccountLoadingFor = (key: keyof LoadingState, value: boolean) => {
        setAccountLoading(prev => ({ ...prev, [key]: value }))
    }

    const addAccount = async (data: FormData) => {
        setAccountLoadingFor('add', true)
        try {
            const res = await accountService.add(data)
            accountStore.addAccount(res)
            return res
        } catch (error) {
            return handleError(error, 'Error adding ')
        } finally {
            setAccountLoadingFor('add', false)
        }
    }

    const editAccount = async (id: string, data: FormData) => {
        setAccountLoadingFor('edit', true)
        try {
            const res = await accountService.save(id, data)
            accountStore.editAccount(res)
            return res
        } catch (error) {
            return handleError(error, 'Error editing ')
        } finally {
            setAccountLoadingFor('edit', false)
        }
    }

    const removeAccount = async (financialAccountId: string) => {
        setAccountLoadingFor('remove', true)
        try {
            const res = await accountService.delete(financialAccountId)
            if (!res) throw new Error('No response from server')
            accountStore.removeAccount(financialAccountId)
            return res
        } catch (error) {
            return handleError(error, 'Error deleting ')
        } finally {
            setAccountLoadingFor('remove', false)
        }
    }

    const getAccount = async (financialAccountId: string, fetchFromServer?: boolean) => {
        setAccountLoadingFor('get', true)
        try {
            return fetchFromServer
                ? await accountService.read<IFinancialAccount | null, IFinancialAccountFilters>({
                      id: financialAccountId
                  })
                : accountStore.getAccount(financialAccountId)
        } catch (error) {
            return handleError(error, 'Error fetching ')
        } finally {
            setAccountLoadingFor('get', false)
        }
    }

    const fetchAccount = async (forceRefresh = false) => {
        setAccountLoadingFor('fetch', true)
        try {
            if (accountStore.accountCacheList.length > 0 && !forceRefresh) {
                return accountStore.accountCacheList
            }
            const res = await accountService.read<IFinancialAccount[], IFinancialAccountFilters>()
            accountStore.setAccounts(res)
            return res
        } catch (error) {
            return handleError(error, 'Error fetching s')
        } finally {
            setAccountLoadingFor('fetch', false)
        }
    }

    const typeList = [
        { value: FinancialAccountType.ONLINE_BANK, label: t('accounts.types.online') },
        { value: FinancialAccountType.BANK_ACCOUNT, label: t('accounts.types.bank') },
        { value: FinancialAccountType.CIRCUIT, label: t('accounts.types.circuit') },
        { value: FinancialAccountType.DEPOSIT_BANK, label: t('accounts.types.deposit') },
        { value: FinancialAccountType.BROKER, label: t('accounts.types.broker') }
    ]

    return {
        accountCacheList: accountStore.accountCacheList,
        accountLoading,
        addAccount,
        editAccount,
        removeAccount,
        getAccount,
        fetchAccount,
        typeList
    }
}
