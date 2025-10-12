import { useState, useEffect, useCallback } from 'react'
import { useForm, FieldValues, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TransactionAction } from '@poveroh/types'
import { TransactionFormProps } from '@/types/form'
import { useError } from '@/hooks/use-error'
import { cloneDeep } from 'lodash'
import logger from '@/lib/logger'

export interface BaseTransactionFormConfig<T extends FieldValues> {
    type: TransactionAction
    defaultValues: T
    schema: z.ZodTypeAny
    transformInitialData?: (data: unknown) => Partial<T>
}

export function useBaseTransactionForm<T extends FieldValues>(
    config: BaseTransactionFormConfig<T>,
    props: TransactionFormProps
) {
    const { handleError } = useError()

    const [file, setFile] = useState<FileList | null>(null)
    const [loading, setLoading] = useState(false)

    const getInitialValues = () => {
        if (props.initialData && config.transformInitialData) {
            return { ...config.defaultValues, ...config.transformInitialData(props.initialData) }
        }
        return config.defaultValues
    }

    const form = useForm<T>({
        resolver: zodResolver(config.schema),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        defaultValues: getInitialValues() as any,
        mode: 'onChange'
    })

    const handleSubmit = async (values: T, dataCallback: (formData: FormData) => Promise<void>) => {
        setLoading(true)
        try {
            const localTransaction: Record<string, unknown> = { ...props.initialData, ...cloneDeep(values) }
            const formData = new FormData()

            formData.append(
                'data',
                JSON.stringify(props.inEditingMode ? { ...props.initialData, ...localTransaction } : localTransaction)
            )
            formData.append('action', config.type)

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

    // Enhanced form reset with proper validation
    const resetFormWithData = useCallback(
        (data: Partial<T>) => {
            form.reset(data as T)
            // Small delay to ensure form fields are rendered
            setTimeout(() => {
                form.trigger()
            }, 100)
        },
        [form]
    )

    // Enhanced field value setter with validation
    const setFieldValue = useCallback(
        (name: string, value: unknown) => {
            form.setValue(name as Path<T>, value as T[Path<T>], { shouldValidate: true })
        },
        [form]
    )

    // Handle initial data changes
    useEffect(() => {
        if (props.initialData && config.transformInitialData) {
            const transformedData = config.transformInitialData(props.initialData)
            resetFormWithData(transformedData)
        }
    }, [props.initialData, config, form, resetFormWithData])

    // Additional effect to ensure form values are properly set after accounts/currencies are loaded
    // This handles timing issues where accounts might not be available during initial form reset
    useEffect(() => {
        if (props.initialData && props.inEditingMode && props.initialData.amounts) {
            // Small delay to ensure form has been reset first
            const timeoutId = setTimeout(() => {
                const initialData = props.initialData!
                if (initialData.amounts?.[0]) {
                    const amount = initialData.amounts[0]
                    if (amount.currency) {
                        setFieldValue('currency', amount.currency)
                    }
                    if (amount.accountId) {
                        // Handle different account field names based on transaction type
                        if (config.type === TransactionAction.EXPENSES) {
                            if (initialData.amounts.length === 1) {
                                setFieldValue('totalAccountId', amount.accountId)
                            }
                        } else if (config.type === TransactionAction.INCOME) {
                            setFieldValue('accountId', amount.accountId)
                        } else if (config.type === TransactionAction.TRANSFER) {
                            setFieldValue('from', amount.accountId)
                            if (initialData.amounts[1]?.accountId) {
                                setFieldValue('to', initialData.amounts[1].accountId)
                            }
                        }
                    }
                }

                // Trigger form validation to clear any "required" errors
                form.trigger()
            }, 100)

            return () => clearTimeout(timeoutId)
        }
    }, [props.initialData, props.inEditingMode, config.type, form, setFieldValue])

    // Bulk field setter for initial data timing issues
    const setFieldValues = (values: Partial<T>) => {
        Object.entries(values).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                setFieldValue(key, value)
            }
        })
        form.trigger()
    }

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            logger.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    const onSubmit = form.handleSubmit(values => handleSubmit(values, props.dataCallback))

    return {
        form,
        loading,
        file,
        setFile,
        handleSubmit,
        onSubmit,
        resetFormWithData,
        setFieldValue,
        setFieldValues
    }
}
