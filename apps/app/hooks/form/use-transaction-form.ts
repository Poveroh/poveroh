import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Currencies, TransactionAction } from '@poveroh/types'
import {
    amountSchema,
    ExpensesFormData,
    FormMode,
    IncomeFormData,
    TransactionFormProps,
    TransferFormData
} from '@/types/form'
import { useError } from '@/hooks/use-error'
import { cloneDeep } from 'lodash'
import logger from '@/lib/logger'

export function useTransactionForm(type: TransactionAction, props: TransactionFormProps) {
    const t = useTranslations()
    const { handleError } = useError()

    const [file, setFile] = useState<FileList | null>(null)
    const [loading, setLoading] = useState(false)

    // Default values and schema per type
    let defaultValues: Partial<FormMode> = {}
    let formSchema: z.ZodTypeAny

    switch (type) {
        case TransactionAction.EXPENSES: {
            const defaultAmounts = {
                amount: 0,
                accountId: ''
            }

            defaultValues = {
                title: '',
                date: new Date().toISOString().split('T')[0],
                currency: Currencies.EUR,
                totalAmount: 0,
                amounts: [defaultAmounts],
                categoryId: '',
                subcategoryId: '',
                note: '',
                ignore: false,
                multipleAmount: false
            } as ExpensesFormData

            const baseSchema = z.object({
                title: z.string().nonempty(t('messages.errors.required')),
                date: z.string({ required_error: t('messages.errors.required') }),
                totalAmount: amountSchema({
                    required_error: t('messages.errors.required'),
                    invalid_type_error: t('messages.errors.pattern')
                }),
                multipleAmount: z.boolean().default(false),
                currency: z.string().nonempty(t('messages.errors.required')),
                categoryId: z.string().nonempty(t('messages.errors.required')),
                subcategoryId: z.string().nonempty(t('messages.errors.required')),
                note: z.string(),
                ignore: z.boolean()
            })

            const amountsSchema = baseSchema.extend({
                multipleAmount: z.literal(true),
                amounts: z
                    .array(
                        z.object({
                            amount: amountSchema({
                                required_error: t('messages.errors.required'),
                                invalid_type_error: t('messages.errors.pattern')
                            }),
                            accountId: z.string().nonempty(t('messages.errors.required'))
                        })
                    )
                    .min(1, 'At least one entry is required')
            })

            const accountSchema = baseSchema.extend({
                multipleAmount: z.literal(false),
                totalAccountId: z.string().nonempty(t('messages.errors.required'))
            })

            formSchema = z.discriminatedUnion('multipleAmount', [amountsSchema, accountSchema]).refine(
                data => {
                    if (data.multipleAmount && 'amounts' in data) {
                        const sum = data.amounts.reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0)
                        return sum === data.totalAmount
                    }
                    return true
                },
                {
                    message: 'Total amount must match the sum of all amounts',
                    path: ['totalAmount']
                }
            )
            break
        }
        case TransactionAction.INCOME:
            defaultValues = {
                title: '',
                date: new Date().toISOString().split('T')[0],
                amount: 0,
                currency: Currencies.EUR,
                accountId: '',
                categoryId: '',
                subcategoryId: '',
                note: '',
                ignore: false
            } as IncomeFormData
            formSchema = z.object({
                title: z.string().nonempty(t('messages.errors.required')),
                date: z.string({ required_error: t('messages.errors.required') }),
                currency: z.string().nonempty(t('messages.errors.required')),
                amount: amountSchema({
                    required_error: t('messages.errors.required'),
                    invalid_type_error: t('messages.errors.pattern')
                }),
                accountId: z.string().nonempty(t('messages.errors.required')),
                categoryId: z.string().nonempty(t('messages.errors.required')),
                subcategoryId: z.string().nonempty(t('messages.errors.required')),
                note: z.string(),
                ignore: z.boolean()
            })
            break
        case TransactionAction.TRANSFER:
            defaultValues = {
                title: '',
                date: new Date().toISOString().split('T')[0],
                amount: 0,
                currency: Currencies.EUR,
                from: '',
                to: '',
                note: '',
                ignore: false
            } as TransferFormData
            formSchema = z
                .object({
                    title: z.string().nonempty(t('messages.errors.required')),
                    date: z.string({ required_error: t('messages.errors.required') }),
                    currency: z.string().nonempty(t('messages.errors.required')),
                    amount: amountSchema({
                        required_error: t('messages.errors.required'),
                        invalid_type_error: t('messages.errors.pattern')
                    }),
                    from: z.string().nonempty(t('messages.errors.required')),
                    to: z.string().nonempty(t('messages.errors.required')),
                    note: z.string(),
                    ignore: z.boolean()
                })
                .refine(data => data.from !== data.to, {
                    message: t('messages.errors.accountMismatch'),
                    path: ['from']
                })
            break
    }

    const form = useForm<FormMode>({
        resolver: zodResolver(formSchema),
        defaultValues: (props.initialData || defaultValues) as FormMode,
        mode: 'onChange'
    })

    const fieldArrayResult = useFieldArray({
        name: 'amounts' as never,
        control: form.control
    })

    const fieldArray = type === TransactionAction.EXPENSES ? fieldArrayResult : undefined

    const handleSubmit = async (
        values: z.infer<typeof formSchema>,
        dataCallback: (formData: FormData) => Promise<void>
    ) => {
        setLoading(true)
        try {
            let localTransaction: Record<string, unknown> = { ...props.initialData, ...cloneDeep(values) }
            const formData = new FormData()

            // Handle expenses form special logic
            if (type === TransactionAction.EXPENSES) {
                const expensesValues = values as ExpensesFormData
                const multipleAmount = expensesValues.multipleAmount
                if (!multipleAmount) {
                    const { totalAmount, totalAccountId, ...rest } = localTransaction
                    localTransaction = {
                        ...rest,
                        amounts: [
                            {
                                amount: totalAmount,
                                accountId: totalAccountId
                            }
                        ]
                    }
                }
            }

            formData.append(
                'data',
                JSON.stringify(props.inEditingMode ? { ...props.initialData, ...localTransaction } : localTransaction)
            )
            formData.append('action', type)

            if (file && file[0]) {
                formData.append('file', file[0])
            }

            await dataCallback(formData)
        } catch (error) {
            handleError(error, 'Form error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            logger.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    // Handle initial data for form
    useEffect(() => {
        if (props.initialData && type === TransactionAction.EXPENSES) {
            let dataInitialToShow: Partial<ExpensesFormData>

            // If there are multiple amounts, use the multipleAmount: true schema
            if (props.initialData.amounts && props.initialData.amounts.length > 1) {
                dataInitialToShow = {
                    ...props.initialData,
                    multipleAmount: true,
                    // Remove totalAccountId if present
                    totalAccountId: undefined
                }
            } else {
                // Otherwise, use the multipleAmount: false schema
                dataInitialToShow = {
                    ...props.initialData,
                    multipleAmount: false,
                    totalAmount: props.initialData.amounts?.[0]?.amount || 0,
                    totalAccountId: props.initialData.amounts?.[0]?.accountId || '',
                    currency: props.initialData.amounts?.[0]?.currency || Currencies.EUR,
                    amounts: undefined
                }
            }

            form.reset(dataInitialToShow as FormMode)
        } else if (props.initialData && type === TransactionAction.INCOME) {
            const incomeData: Partial<IncomeFormData> = {
                ...props.initialData,
                amount: props.initialData.amounts?.[0]?.amount || 0,
                currency: props.initialData.amounts?.[0]?.currency || Currencies.EUR,
                accountId: props.initialData.amounts?.[0]?.accountId || ''
            }
            form.reset(incomeData as FormMode)
        }
    }, [props.initialData, type, form])

    const calculateTotal = () => {
        const values = form.getValues()
        if ('amounts' in values && Array.isArray(values.amounts)) {
            return values.amounts.reduce((acc: number, curr: { amount: number }) => acc + (curr.amount || 0), 0)
        }
        return 0
    }

    const multipleAmount = form.watch('multipleAmount')

    const toggleMultipleAmount = () => {
        form.setValue('multipleAmount', !multipleAmount)
    }

    return {
        form,
        fieldArray,
        loading,
        file,
        multipleAmount,
        calculateTotal,
        toggleMultipleAmount,
        setFile,
        handleSubmit
    }
}
