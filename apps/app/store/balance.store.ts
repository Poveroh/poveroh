import { IBalance, IReports } from '@poveroh/types'
import { create } from 'zustand'

type BalanceStore = {
    balance: IBalance | null
    reports: IReports | null
    setBalance: (balance: IBalance) => void
    setReports: (reports: IReports) => void
    clearBalance: () => void
}

export const useBalanceStore = create<BalanceStore>(set => ({
    balance: null,
    reports: null,

    setBalance: balance => {
        set(() => ({
            balance
        }))
    },

    setReports: reports => {
        set(() => ({
            reports
        }))
    },

    clearBalance: () => {
        set(() => ({
            balance: null,
            reports: null
        }))
    }
}))
