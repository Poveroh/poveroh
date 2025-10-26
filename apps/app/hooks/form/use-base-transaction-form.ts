import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm, FieldValues, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BaseTransactionFormConfig, TransactionFormProps } from '@/types/form'
import { useError } from '@/hooks/use-error'
import { cloneDeep } from 'lodash'
import logger from '@/lib/logger'

export function useBaseTransactionForm<T extends FieldValues>(
    config: BaseTransactionFormConfig<T>,
    props: TransactionFormProps
) {
    const { handleError } = useError()

    // Handle initial data changes -
    // use a ref to track if we've already processed this data
    const processedDataRef = useRef<string>('')

    const [file, setFile] = useState<FileList | null>(null)
    const [loading, setLoading] = useState(false)

    const getInitialValues = () => {
        if (props.initialData && config.transformInitialData) {
            const transformed = config.transformInitialData(props.initialData)
            const merged = { ...config.defaultValues, ...transformed }
            console.log('Initial values for', config.type, ':', merged)
            return merged
        }
        console.log('Using default values for', config.type, ':', config.defaultValues)
        return config.defaultValues
    }

    const form = useForm<T>({
        resolver: zodResolver(config.schema),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        defaultValues: getInitialValues() as any,
        mode: 'onBlur'
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
            console.log('Resetting form with data:', data)
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

    useEffect(() => {
        // Create a stable key for the current data state
        const dataKey = `${JSON.stringify(props.initialData)}-${props.inEditingMode}`

        // Only process if this exact data combination hasn't been processed before
        if (props.initialData && config.transformInitialData && processedDataRef.current !== dataKey) {
            console.log('🔄 Processing initial data for', config.type, ':', props.initialData)
            processedDataRef.current = dataKey
            const transformedData = config.transformInitialData(props.initialData)
            console.log('🔄 Transformed data for', config.type, ':', transformedData)

            // Reset form with transformed data
            const finalData = { ...config.defaultValues, ...transformedData } as T
            console.log('🔄 Final data for form reset:', finalData)
            form.reset(finalData)
            setTimeout(() => {
                form.trigger()
            }, 100)
        }
    }, [props.initialData, props.inEditingMode, config, form])

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
