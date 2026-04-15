import { useFieldArray } from 'react-hook-form'
import { useBaseTransactionForm } from './use-base-transaction-form'
import { BaseTransactionFormConfig, TransactionFormProps } from '@/types/form'
import { useConfig } from '../use-config'
import { CurrencyEnum, TransactionActionEnum, TransactionData, TransactionForm } from '@poveroh/types'
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

function getDefaultValues(type: TransactionActionEnum, currency: CurrencyEnum): TransactionForm {
    const base: Omit<TransactionForm, 'amounts' | 'action'> = {
        title: '',
        date: new Date().toISOString().split('T')[0]!,
        categoryId: null,
        subcategoryId: null,
        note: null,
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

function transformInitialData(type: TransactionActionEnum, data: TransactionData): TransactionForm {
    const base: Omit<TransactionForm, 'amounts' | 'action'> = {
        title: data.title || '',
        date: data.date ? data.date.split('T')[0]! : new Date().toISOString().split('T')[0]!,
        categoryId: data.categoryId ?? null,
        subcategoryId: data.subcategoryId ?? null,
        note: data.note ?? null,
        ignore: data.ignore || false,
        currency: (data.amounts?.[0]?.currency as CurrencyEnum) ?? ('UNKNOWN' as CurrencyEnum)
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

    const defaultValues = getDefaultValues(type, preferedCurrency as CurrencyEnum)

    const config: BaseTransactionFormConfig<TransactionForm> = {
        type,
        defaultValues,
        schema: getSchema(type),
        transformInitialData: (data: TransactionData) => transformInitialData(type, data)
    }

    const baseForm = useBaseTransactionForm<TransactionForm>(config, props)

    const fieldArray = useFieldArray({
        name: 'amounts',
        control: baseForm.form.control
    })

    const onSubmit =
        type === 'TRANSFER'
            ? baseForm.form.handleSubmit(
                  async values => {
                      const amount = values.amounts[0]?.amount ?? 0
                      const synced = {
                          ...values,
                          amounts: values.amounts.map(a => ({ ...a, amount }))
                      }
                      await baseForm.handleSubmit(synced, props.dataCallback)
                  },
                  errors => {
                      console.error('Form validation errors on submit:', errors)
                  }
              )
            : baseForm.onSubmit

    const calculateTotal = () => {
        const values = baseForm.form.getValues()
        if (values.amounts && Array.isArray(values.amounts)) {
            return values.amounts.reduce((acc: number, curr) => acc + (curr.amount || 0), 0)
        }
        return 0
    }

    return {
        ...baseForm,
        onSubmit,
        fieldArray,
        calculateTotal
    }
}
