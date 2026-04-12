'use client'

import { useCategory } from './use-category'
import { useFinancialAccount } from './use-account'
import { useConfig } from './use-config'
import DynamicIcon from '@/components/icon/dynamic-icon'
import { FilterField, TransactionFilters } from '@poveroh/types'
import { isDateFilter } from '@/utils/filter'

export const useTransactionFilterConfig = () => {
    const { categoryData } = useCategory()
    const { accountQuery } = useFinancialAccount()
    const { renderDate } = useConfig()

    const filterFields: FilterField[] = [
        {
            name: 'action',
            label: 'form.type.label',
            type: 'select',
            options: [
                { label: 'Income', value: 'INCOME' },
                { label: 'Expense', value: 'EXPENSES' },
                { label: 'Transfer', value: 'TRANSFER' }
            ]
        },
        {
            name: 'categoryId',
            label: 'form.category.label',
            type: 'select',
            options: categoryData.map(cat => ({
                label: cat.title,
                value: cat.id
            }))
        },
        {
            fromName: 'fromDate',
            toName: 'toDate',
            label: 'form.date.label',
            type: 'dateRange'
        }
    ]

    const getFilterLabel = (key: keyof TransactionFilters, value: TransactionFilters[keyof TransactionFilters]) => {
        if (key === 'action') {
            if (value === 'INCOME') return 'Income'
            if (value === 'EXPENSES') return 'Expense'
            if (value === 'TRANSFER') return 'Transfer'
        }
        if (key === 'categoryId') {
            return categoryData.find(c => c.id === value)?.title || String(value)
        }
        if (key === 'financialAccountId') {
            return accountQuery.data?.data.find(a => a.id === value)?.title || String(value)
        }
        if (key === 'date') {
            if (!isDateFilter(value)) return String(value)

            if (value.gte && value.lte) {
                return (
                    <div className='flex flex-row gap-1'>
                        {renderDate(value.gte)}
                        <DynamicIcon name='move-right' />
                        {renderDate(value.lte)}
                    </div>
                )
            }
            if (value.gte) return `From ${renderDate(value.gte)}`
            if (value.lte) return `To ${renderDate(value.lte)}`
        }
        return String(value)
    }

    return { filterFields, getFilterLabel }
}
