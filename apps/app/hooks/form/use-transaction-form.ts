import { useFieldArray } from 'react-hook-form'
import { useBaseTransactionForm } from './use-base-transaction-form'
import { BaseTransactionFormConfig, TransactionFormProps } from '@/types/form'
import { useConfig } from '../use-config'
import { TransactionActionEnum, TransactionData, TransactionFormData } from '@poveroh/types'
import { TransactionFormSchema } from '@poveroh/schemas'

function getSchema(type: TransactionActionEnum) {
    switch (type) {
        case 'INCOME':
        case 'EXPENSES':
            return TransactionFormSchema.refine(data => data.categoryId && data.categoryId.length > 0, {
                message: 'Category is required',
                path: ['categoryId']
            })
        case 'TRANSFER':
            return TransactionFormSchema.refine(
                data => {
                    const from = data.amounts.find(a => a.action === 'EXPENSES')
                    const to = data.amounts.find(a => a.action === 'INCOME')
                    return from && to && from.financialAccountId !== to.financialAccountId
                },
                {
                    message: 'From and To accounts must be different',
                    path: ['amounts']
                }
            )
    }
}

function getDefaultValues(type: TransactionActionEnum, currency: string): TransactionFormData {
    const base: Omit<TransactionFormData, 'amounts' | 'action'> = {
        title: '',
        date: new Date().toISOString().split('T')[0]!,
        categoryId: '',
        subcategoryId: '',
        note: '',
        ignore: false,
        currency
    }

    switch (type) {
        case 'INCOME':
            return {
                ...base,
                action: 'INCOME',
                amounts: [{ amount: 0, action: 'INCOME', financialAccountId: '' }]
            }
        case 'EXPENSES':
            return {
                ...base,
                action: 'EXPENSES',
                amounts: [{ amount: 0, action: 'EXPENSES', financialAccountId: '' }]
            }
        case 'TRANSFER':
            return {
                ...base,
                action: 'TRANSFER',
                amounts: [
                    { amount: 0, action: 'EXPENSES', financialAccountId: '' },
                    { amount: 0, action: 'INCOME', financialAccountId: '' }
                ]
            }
    }
}

function transformInitialData(type: TransactionActionEnum, data: TransactionData): TransactionFormData {
    const base: Omit<TransactionFormData, 'amounts' | 'action'> = {
        title: data.title || '',
        date: data.date ? data.date.split('T')[0]! : new Date().toISOString().split('T')[0]!,
        categoryId: data.categoryId || '',
        subcategoryId: data.subcategoryId || '',
        note: data.note || '',
        ignore: data.ignore || false,
        currency: data.amounts?.[0]?.currency || ''
    }

    const amounts = data.amounts as
        | Array<{
              amount: number
              action: TransactionActionEnum
              financialAccountId: string
              currency: string
          }>
        | undefined

    switch (type) {
        case 'INCOME': {
            const firstAmount = amounts?.[0]
            return {
                ...base,
                action: 'INCOME',
                amounts: [
                    {
                        amount: Math.abs(Number(firstAmount?.amount || 0)),
                        action: 'INCOME',
                        financialAccountId: firstAmount?.financialAccountId || ''
                    }
                ]
            }
        }
        case 'EXPENSES': {
            return {
                ...base,
                action: 'EXPENSES',
                amounts: (amounts || []).map(amt => ({
                    amount: Math.abs(amt.amount),
                    action: 'EXPENSES',
                    financialAccountId: amt.financialAccountId
                }))
            }
        }
        case 'TRANSFER': {
            const fromAmount = amounts?.find(amt => amt.action === 'EXPENSES')
            const toAmount = amounts?.find(amt => amt.action === 'INCOME')
            const firstAmount = amounts?.[0]
            return {
                ...base,
                action: 'TRANSFER',
                amounts: [
                    {
                        amount: Math.abs(Number(firstAmount?.amount || 0)),
                        action: 'EXPENSES',
                        financialAccountId: fromAmount?.financialAccountId || ''
                    },
                    {
                        amount: Math.abs(Number(firstAmount?.amount || 0)),
                        action: 'INCOME',
                        financialAccountId: toAmount?.financialAccountId || ''
                    }
                ]
            }
        }
    }
}

export function useTransactionForm(type: TransactionActionEnum, props: TransactionFormProps) {
    const { preferedCurrency } = useConfig()

    const defaultValues = getDefaultValues(type, preferedCurrency)

    const config: BaseTransactionFormConfig<TransactionFormData> = {
        type,
        defaultValues,
        schema: getSchema(type),
        transformInitialData: (data: TransactionData) => transformInitialData(type, data)
    }

    const baseForm = useBaseTransactionForm<TransactionFormData>(config, props)

    const fieldArray = useFieldArray({
        name: 'amounts',
        control: baseForm.form.control
    })

    const calculateTotal = () => {
        const values = baseForm.form.getValues()
        if (values.amounts && Array.isArray(values.amounts)) {
            return values.amounts.reduce((acc: number, curr) => acc + (curr.amount || 0), 0)
        }
        return 0
    }

    return {
        ...baseForm,
        fieldArray,
        calculateTotal
    }
}
