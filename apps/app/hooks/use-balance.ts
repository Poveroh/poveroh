import { useState, useEffect } from 'react'
import { BalanceService } from '@/services/balance.service'
import { useBalanceStore } from '@/store/balance.store'
import { useError } from './use-error'
import { LoadingState } from '@/types/general'

export function useBalance() {
    const { handleError } = useError()

    const balanceService = new BalanceService()
    const balanceStore = useBalanceStore()

    const [balanceLoading, setBalanceLoading] = useState<LoadingState>({
        add: false,
        edit: false,
        remove: false,
        get: false,
        fetch: false
    })

    const setLoadingFor = (key: keyof LoadingState, value: boolean) => {
        setBalanceLoading(prev => ({ ...prev, [key]: value }))
    }

    const fetchBalance = async () => {
        setLoadingFor('fetch', true)
        try {
            const response = await balanceService.getTotalBalance()
            balanceStore.setBalance(response)
        } catch (error) {
            handleError(error, 'Errore nel caricamento del balance')
        } finally {
            setLoadingFor('fetch', false)
        }
    }

    const fetchReports = async () => {
        setLoadingFor('fetch', true)
        try {
            const response = await balanceService.getReports()
            balanceStore.setReports(response)
        } catch (error) {
            handleError(error, 'Errore nel caricamento dei reports')
        } finally {
            setLoadingFor('fetch', false)
        }
    }

    useEffect(() => {
        fetchBalance()
    }, [])

    return {
        balance: balanceStore.balance,
        reports: balanceStore.reports,
        loading: balanceLoading,
        fetchBalance,
        fetchReports
    }
}
