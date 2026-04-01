import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useError } from '@/hooks/use-error'
import { iconList } from '@/components/icon'
import { CreateUpdateSubcategoryRequest, SubcategoryData, SubcategoryForm } from '@poveroh/types'
import { SubcategoryFormSchema } from '@poveroh/schemas'

export function useSubcategoryForm(initialData: SubcategoryData | null, inEditingMode: boolean = false) {
    const { handleError } = useError()

    const [icon, setIcon] = useState(iconList[0])
    const [loading, setLoading] = useState(false)

    const defaultValues = {
        title: '',
        description: '',
        logoIcon: iconList[0] as string,
        categoryId: initialData?.categoryId || ''
    }

    const form = useForm({
        resolver: zodResolver(SubcategoryFormSchema),
        defaultValues: defaultValues
    })

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                description: initialData.description || ''
            })
            setIcon(initialData.logoIcon)
        }
    }, [initialData, form])

    const handleSubmit = async (
        values: SubcategoryForm,
        dataCallback: (formData: CreateUpdateSubcategoryRequest, files: File[]) => Promise<void>
    ) => {
        try {
            setLoading(true)

            await dataCallback(inEditingMode ? { ...initialData, ...values } : values, [])
        } catch (error) {
            handleError(error, 'Form error')
        } finally {
            setLoading(false)
        }
    }

    const handleIconChange = (iconName: string) => {
        form.setValue('logoIcon', iconName)
        setIcon(iconName)
    }

    return {
        form,
        icon,
        loading,
        handleSubmit,
        handleIconChange
    }
}
