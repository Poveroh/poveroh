'use client'

import { AccountService } from '@/services/account.service'
import { useAccountStore } from '@/store/account.store'
import { AccountType, IAccount, IAccountFilters } from '@poveroh/types'
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

    const removeAccount = async (accountId: string) => {
        setAccountLoadingFor('remove', true)
        try {
            const res = await accountService.delete(accountId)
            if (!res) throw new Error('No response from server')
            accountStore.removeAccount(accountId)
            return res
        } catch (error) {
            return handleError(error, 'Error deleting ')
        } finally {
            setAccountLoadingFor('remove', false)
        }
    }

    const getAccount = async (accountId: string, fetchFromServer?: boolean) => {
        setAccountLoadingFor('get', true)
        try {
            return fetchFromServer
                ? await accountService.read<IAccount | null, IAccountFilters>({ id: accountId })
                : accountStore.getAccount(accountId)
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
            const res = await accountService.read<IAccount[], IAccountFilters>()
            accountStore.setAccounts(res)
            return res
        } catch (error) {
            return handleError(error, 'Error fetching s')
        } finally {
            setAccountLoadingFor('fetch', false)
        }
    }

    const typeList = [
        { value: AccountType.ONLINE_BANK, label: t('accounts.types.online') },
        { value: AccountType.BANK_ACCOUNT, label: t('accounts.types.bank') },
        { value: AccountType.CIRCUIT, label: t('accounts.types.circuit') },
        { value: AccountType.DEPOSIT_BANK, label: t('accounts.types.deposit') },
        { value: AccountType.BROKER, label: t('accounts.types.broker') }
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
