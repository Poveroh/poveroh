'use client'

import { FinancialAccountService } from '@/services/account.service'
import { useFinancialAccountStore } from '@/store/account.store'
import { FinancialAccountType, IFinancialAccount, IFinancialAccountFilters } from '@poveroh/types'
import { useTranslations } from 'next-intl'
import { useError } from './use-error'
import { useState } from 'react'
import { LoadingState } from '@/types/general'

export const useFinancialAccount = () => {
    const t = useTranslations()
    const { handleError } = useError()

    const financialAccountService = new FinancialAccountService()
    const financialAccountStore = useFinancialAccountStore()

    const [financialAccountLoading, setFinancialAccountLoading] = useState<LoadingState>({
        add: false,
        edit: false,
        remove: false,
        get: false,
        fetch: false
    })

    const setFinancialAccountLoadingFor = (key: keyof LoadingState, value: boolean) => {
        setFinancialAccountLoading(prev => ({ ...prev, [key]: value }))
    }

    const addFinancialAccount = async (data: FormData) => {
        setFinancialAccountLoadingFor('add', true)
        try {
            const res = await financialAccountService.add(data)
            financialAccountStore.addFinancialAccount(res)
            return res
        } catch (error) {
            return handleError(error, 'Error adding ')
        } finally {
            setFinancialAccountLoadingFor('add', false)
        }
    }

    const editFinancialAccount = async (id: string, data: FormData) => {
        setFinancialAccountLoadingFor('edit', true)
        try {
            const res = await financialAccountService.save(id, data)
            financialAccountStore.editFinancialAccount(res)
            return res
        } catch (error) {
            return handleError(error, 'Error editing ')
        } finally {
            setFinancialAccountLoadingFor('edit', false)
        }
    }

    const removeFinancialAccount = async (financialAccountId: string) => {
        setFinancialAccountLoadingFor('remove', true)
        try {
            const res = await financialAccountService.delete(financialAccountId)
            if (!res) throw new Error('No response from server')
            financialAccountStore.removeFinancialAccount(financialAccountId)
            return res
        } catch (error) {
            return handleError(error, 'Error deleting ')
        } finally {
            setFinancialAccountLoadingFor('remove', false)
        }
    }

    const getFinancialAccount = async (financialAccountId: string, fetchFromServer?: boolean) => {
        setFinancialAccountLoadingFor('get', true)
        try {
            return fetchFromServer
                ? await financialAccountService.read<IFinancialAccount | null, IFinancialAccountFilters>({
                      id: financialAccountId
                  })
                : financialAccountStore.getFinancialAccount(financialAccountId)
        } catch (error) {
            return handleError(error, 'Error fetching ')
        } finally {
            setFinancialAccountLoadingFor('get', false)
        }
    }

    const fetchFinancialAccount = async (forceRefresh = false) => {
        setFinancialAccountLoadingFor('fetch', true)
        try {
            if (financialAccountStore.financialAccountCacheList.length > 0 && !forceRefresh) {
                return financialAccountStore.financialAccountCacheList
            }
            const res = await financialAccountService.read<IFinancialAccount[], IFinancialAccountFilters>()
            financialAccountStore.setFinancialAccounts(res)
            return res
        } catch (error) {
            return handleError(error, 'Error fetching s')
        } finally {
            setFinancialAccountLoadingFor('fetch', false)
        }
    }

    const TYPE_LIST = [
        { value: FinancialAccountType.ONLINE_BANK, label: t('accounts.types.online') },
        { value: FinancialAccountType.BANK_ACCOUNT, label: t('accounts.types.bank') },
        { value: FinancialAccountType.CIRCUIT, label: t('accounts.types.circuit') },
        { value: FinancialAccountType.DEPOSIT_BANK, label: t('accounts.types.deposit') },
        { value: FinancialAccountType.BROKER, label: t('accounts.types.broker') }
    ]

    return {
        financialAccountCacheList: financialAccountStore.financialAccountCacheList,
        financialAccountLoading,
        addFinancialAccount,
        editFinancialAccount,
        removeFinancialAccount,
        getFinancialAccount,
        fetchFinancialAccount,
        TYPE_LIST
    }
}
