import { useCallback, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { useError } from '@/hooks/useError'
import { useCategory } from '@/hooks/useCategory'
import { useBankAccount } from '@/hooks/useBankAccount'
import { ISubcategory, TransactionAction } from '@poveroh/types'
import logger from '@/lib/logger'
import { amountSchema } from '@/types/form'
import {
    TransactionSchema,
    TransactionType,
    Transaction,
    IncomeTransaction,
    ExpenseTransaction,
    TransferTransaction,
    TransactionPaymentSchema
} from '@/schemas/transaction' // I tuoi schema Zod

type UseTransactionFormProps<T extends Transaction = Transaction> = {
    initialData?: Partial<T>
    action: TransactionAction
    transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER'
    onSubmit: (formData: FormData) => Promise<void>
}

export function useTransactionForm<T extends Transaction = Transaction>({
    initialData,
    action,
    transactionType,
    onSubmit
}: UseTransactionFormProps<T>) {
    const t = useTranslations()
    const { handleError } = useError()
    const { categoryCacheList } = useCategory()
    const { bankAccountCacheList } = useBankAccount()

    const [subcategoryList, setSubcategoryList] = useState<ISubcategory[]>([])
    const [file, setFile] = useState<FileList | null>(null)
    const [fileError, setFileError] = useState(false)
    const [isMultiplePayments, setIsMultiplePayments] = useState(false)

    // Schema dinamico basato sul tipo di transazione
    const getTransactionSchema = useCallback(() => {
        const baseFields = {
            description: z.string().optional(),
            transaction_date: z.string({
                required_error: t('messages.errors.required')
            }),
            total_amount: amountSchema({
                requiredError: t('messages.errors.required'),
                invalidTypeError: t('messages.errors.pattern')
            }).positive(t('messages.errors.positive')),
            currency: z.string().length(3).default('EUR')
        }

        switch (transactionType) {
            case 'INCOME':
                return z.object({
                    ...baseFields,
                    type: z.literal('INCOME'),
                    to_account_id: z.number({
                        required_error: t('messages.errors.required')
                    }),
                    category_id: z.number().optional(),
                    subcategory_id: z.number().optional()
                })

            case 'EXPENSE':
                return z
                    .object({
                        ...baseFields,
                        type: z.literal('EXPENSE'),
                        category_id: z.number().optional(),
                        subcategory_id: z.number().optional(),
                        // Campi condizionali per pagamento singolo vs multiplo
                        from_account_id: z.number().optional(),
                        payments: z
                            .array(
                                z.object({
                                    account_id: z.number(),
                                    amount: amountSchema({
                                        requiredError: t('messages.errors.required'),
                                        invalidTypeError: t('messages.errors.pattern')
                                    }).positive(),
                                    currency: z.string().length(3).default('EUR')
                                })
                            )
                            .optional()
                    })
                    .refine(
                        data => {
                            // Validazione: o from_account_id OR payments, ma non entrambi
                            const hasSingleAccount = !!data.from_account_id
                            const hasMultiplePayments = data.payments && data.payments.length > 0

                            if (!hasSingleAccount && !hasMultiplePayments) {
                                return false // Deve avere almeno uno
                            }

                            if (hasSingleAccount && hasMultiplePayments) {
                                return false // Non può avere entrambi
                            }

                            // Se pagamenti multipli, verifica che la somma corrisponda al totale
                            if (hasMultiplePayments) {
                                const paymentsTotal = data.payments!.reduce((sum, payment) => sum + payment.amount, 0)
                                return Math.abs(paymentsTotal - data.total_amount) < 0.01
                            }

                            return true
                        },
                        {
                            message: t('messages.errors.payment_validation'),
                            path: ['payments']
                        }
                    )

            case 'TRANSFER':
                return z
                    .object({
                        ...baseFields,
                        type: z.literal('TRANSFER'),
                        from_account_id: z.number({
                            required_error: t('messages.errors.required')
                        }),
                        to_account_id: z.number({
                            required_error: t('messages.errors.required')
                        })
                    })
                    .refine(
                        data => {
                            return data.from_account_id !== data.to_account_id
                        },
                        {
                            message: t('messages.errors.same_account'),
                            path: ['to_account_id']
                        }
                    )

            default:
                throw new Error(`Tipo transazione non supportato: ${transactionType}`)
        }
    }, [transactionType, t])

    // Valori di default dinamici basati sul tipo
    const getDefaultValues = useCallback(() => {
        const baseDefaults = {
            description: '',
            transaction_date: new Date().toISOString().split('T')[0],
            total_amount: 0,
            currency: 'EUR'
        }

        switch (transactionType) {
            case 'INCOME':
                return {
                    ...baseDefaults,
                    type: 'INCOME' as const,
                    to_account_id: undefined,
                    category_id: undefined,
                    subcategory_id: undefined
                }

            case 'EXPENSE':
                return {
                    ...baseDefaults,
                    type: 'EXPENSE' as const,
                    from_account_id: undefined,
                    category_id: undefined,
                    subcategory_id: undefined,
                    payments: undefined
                }

            case 'TRANSFER':
                return {
                    ...baseDefaults,
                    type: 'TRANSFER' as const,
                    from_account_id: undefined,
                    to_account_id: undefined
                }
        }
    }, [transactionType])

    const formSchema = getTransactionSchema()
    const defaultValues = getDefaultValues()

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || defaultValues
    })

    // Gestione sottocategorie quando cambia la categoria
    const parseSubcategoryList = useCallback(
        async (categoryId: string | number) => {
            const category = categoryCacheList.find(item => item.id === categoryId)
            const res = category ? category.subcategories : []
            setSubcategoryList(res)
        },
        [categoryCacheList]
    )

    // Aggiungi/rimuovi pagamento per spese multiple
    const addPayment = useCallback(() => {
        const currentPayments = form.getValues('payments') || []
        form.setValue('payments', [...currentPayments, { account_id: 0, amount: 0, currency: 'EUR' }])
    }, [form])

    const removePayment = useCallback(
        (index: number) => {
            const currentPayments = form.getValues('payments') || []
            const newPayments = currentPayments.filter((_, i) => i !== index)
            form.setValue('payments', newPayments)

            // Se non ci sono più pagamenti, torna al pagamento singolo
            if (newPayments.length === 0) {
                setIsMultiplePayments(false)
            }
        },
        [form]
    )

    // Toggle tra pagamento singolo e multiplo (solo per EXPENSE)
    const toggleMultiplePayments = useCallback(() => {
        if (transactionType !== 'EXPENSE') return

        const newIsMultiple = !isMultiplePayments
        setIsMultiplePayments(newIsMultiple)

        if (newIsMultiple) {
            // Passa da singolo a multiplo: crea primo pagamento con i dati esistenti
            const currentAmount = form.getValues('total_amount') || 0
            const currentAccount = form.getValues('from_account_id')

            form.setValue('from_account_id', undefined)
            form.setValue('payments', [
                {
                    account_id: currentAccount || 0,
                    amount: currentAmount,
                    currency: form.getValues('currency') || 'EUR'
                }
            ])
        } else {
            // Passa da multiplo a singolo: usa il primo pagamento
            const payments = form.getValues('payments') || []
            if (payments.length > 0) {
                form.setValue('from_account_id', payments[0].account_id)
            }
            form.setValue('payments', undefined)
        }
    }, [isMultiplePayments, transactionType, form])

    // Calcolo automatico del totale per pagamenti multipli
    const calculateTotal = useCallback(() => {
        if (transactionType !== 'EXPENSE' || !isMultiplePayments) return

        const payments = form.getValues('payments') || []
        const total = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
        form.setValue('total_amount', total)
    }, [form, transactionType, isMultiplePayments])

    // Gestione submit del form
    const handleSubmit = useCallback(
        async (values: any) => {
            try {
                // Validazione finale con schema completo
                const validatedData = TransactionSchema.parse({
                    ...values,
                    type: transactionType
                })

                const formData = new FormData()
                const dataToSubmit = initialData ? { ...initialData, ...validatedData } : validatedData

                formData.append('data', JSON.stringify(dataToSubmit))
                formData.append('action', action)

                if (file && file[0]) {
                    formData.append('file', file[0])
                }

                await onSubmit(formData)
            } catch (error) {
                handleError(error, 'Transaction form submission error')
            }
        },
        [initialData, action, file, onSubmit, handleError, transactionType]
    )

    // Aggiorna form quando cambiano i dati iniziali
    useEffect(() => {
        if (initialData) {
            form.reset({
                ...defaultValues,
                ...initialData
            })

            // Imposta modalità pagamenti multipli se necessario
            if (transactionType === 'EXPENSE' && initialData.payments && initialData.payments.length > 0) {
                setIsMultiplePayments(true)
            }
        }
    }, [initialData, form, defaultValues, transactionType])

    // Log errori per debug
    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            logger.debug('Transaction form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    // Filtra categorie in base al tipo di transazione
    const filteredCategories = categoryCacheList.filter(category => {
        if (transactionType === 'TRANSFER') return false // I transfer non hanno categorie
        return category.type === transactionType
    })

    return {
        form,
        subcategoryList,
        setSubcategoryList,
        parseSubcategoryList,
        file,
        setFile,
        fileError,
        setFileError,
        handleSubmit,
        categoryCacheList: filteredCategories,
        bankAccountCacheList,
        t,
        // Nuove funzionalità per pagamenti multipli
        isMultiplePayments,
        setIsMultiplePayments,
        toggleMultiplePayments,
        addPayment,
        removePayment,
        calculateTotal,
        transactionType
    }
}
