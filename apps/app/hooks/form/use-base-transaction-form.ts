import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm, FieldValues, Path, DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BaseTransactionFormConfig, TransactionFormProps } from '@/types/form'
import { useError } from '@/hooks/use-error'
import logger from '@/lib/logger'
import { ITransaction } from '@poveroh/types/dist'

/**
 * Custom hook for managing base transaction form state and operations.
 *
 * This hook provides a unified interface for handling transaction forms with features like:
 * - Form validation using react-hook-form and zod
 * - Initial data transformation and processing
 * - File upload handling
 * - Loading states
 * - Error handling
 * - Dynamic field value setting and form reset capabilities
 *
 * @template T - The form data type extending FieldValues // ExpensesFormData | IncomeFormData | TransferFormData
 * @param config - Configuration object containing schema, default values, and transformation functions
 * @param props - Props containing initial data, editing mode, and data callback
 * @returns Object containing form instance, loading state, and utility functions
 */
export function useBaseTransactionForm<T extends FieldValues>(
    config: BaseTransactionFormConfig<T>,
    props: TransactionFormProps
) {
    const { handleError } = useError()

    const [file, setFile] = useState<FileList | null>(null)
    const [loading, setLoading] = useState(false)

    const getInitialValues = (): T => {
        if (props.initialData && config.transformInitialData) {
            const transformed = config.transformInitialData(props.initialData)
            console.log('Initial values for', config.type, ':', transformed)
            return transformed
        }
        return config.defaultValues
    }

    const form = useForm<T>({
        resolver: zodResolver(config.schema),
        defaultValues: getInitialValues() as DefaultValues<T>,
        mode: 'onBlur'
    })

    const handleSubmit = async (values: T, dataCallback: (formData: FormData) => Promise<void>) => {
        setLoading(true)
        try {
            let localTransaction: T = { ...values }
            if (props.initialData && config.transformInitialData && props.inEditingMode) {
                const transformInitialData = config.transformInitialData(props.initialData as ITransaction)
                localTransaction = { ...transformInitialData, ...localTransaction }
            }

            const formData = new FormData()

            formData.append('data', JSON.stringify(localTransaction))
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
            console.log('Resetting form with data:', data)
            form.reset(data as T)

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
