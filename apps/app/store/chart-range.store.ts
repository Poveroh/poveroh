import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ChartRange } from '@poveroh/types'

type ChartRangeStore = {
    range: ChartRange
    setRange: (range: ChartRange) => void
}

export const useChartRangeStore = create<ChartRangeStore>()(
    persist(
        set => ({
            range: '30D',
            setRange: range => set(() => ({ range }))
        }),
        {
            name: 'chart-range'
        }
    )
)
