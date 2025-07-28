import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { ISubcategory } from '@poveroh/types'
import { useError } from '@/hooks/use-error'
import { iconList } from '@/components/icon'

export function useSubcategoryForm(initialData?: ISubcategory | null, inEditingMode: boolean = false) {
    const t = useTranslations()
    const { handleError } = useError()

    const [icon, setIcon] = useState(iconList[0])
    const [loading, setLoading] = useState(false)

    const defaultValues = {
        title: '',
        description: '',
        logoIcon: iconList[0] as string,
        categoryId: initialData?.categoryId || ''
    }

    const formSchema = z.object({
        title: z.string().nonempty(t('messages.errors.required')),
        description: z.string(),
        logoIcon: z.string().nonempty(t('messages.errors.required')),
        categoryId: z.string()
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    useEffect(() => {
        if (initialData) {
            form.reset(initialData)
            setIcon(initialData.logoIcon)
        }
    }, [initialData, form])

    const handleSubmit = async (
        values: z.infer<typeof formSchema>,
        dataCallback: (formData: FormData) => Promise<void>
    ) => {
        try {
            setLoading(true)

            const formData = new FormData()
            formData.append('data', JSON.stringify(inEditingMode ? { ...initialData, ...values } : values))
            await dataCallback(formData)
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
