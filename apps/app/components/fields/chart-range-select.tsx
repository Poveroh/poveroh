'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { useChartRange } from '@/hooks/use-chart-range'

export const ChartRangeSelect = () => {
    const { range, setRange, options } = useChartRange()

    return (
        <div className='w-fit'>
            <Select value={range} onValueChange={value => setRange(value as typeof range)}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
