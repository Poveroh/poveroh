'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { AppearanceMode, Currencies, CyclePeriod, ISubscription, RememberPeriod } from '@poveroh/types'

import { useError } from '@/hooks/use-error'
import { iconList } from '@/components/icon'

export const useSubscriptionForm = (initialData: ISubscription | null | undefined, inEditingMode: boolean) => {
    const t = useTranslations()
    const { handleError } = useError()

    const [icon, setIcon] = useState(iconList[0])
    const [loading, setLoading] = useState(false)

    const defaultValues = initialData || {
        title: '',
        description: '',
        amount: 0,
        currency: Currencies.EUR,
        appearanceMode: AppearanceMode.ICON,
        appearanceLogoIcon: iconList[0] as string,
        firstPayment: new Date().toISOString().split('T')[0],
        cycleNumber: '1',
        cyclePeriod: CyclePeriod.MONTH,
        rememberPeriod: RememberPeriod.THREE_DAYS,
        accountId: ''
    }

    const formSchema = z
        .object({
            title: z.string().nonempty(t('messages.errors.required')),
            description: z.string().optional(),
            amount: z.number().min(0),
            currency: z.nativeEnum(Currencies),
            appearanceMode: z.nativeEnum(AppearanceMode),
            appearanceLogoIcon: z.string().nonempty(t('messages.errors.required')),
            firstPayment: z.string(),
            cycleNumber: z.string(),
            cyclePeriod: z.nativeEnum(CyclePeriod),
            rememberPeriod: z.nativeEnum(RememberPeriod).optional(),
            accountId: z.string().nonempty(t('messages.errors.required'))
        })
        .refine(
            data => {
                if (data.appearanceMode === AppearanceMode.LOGO) {
                    return z.string().safeParse(data.appearanceLogoIcon).success
                }
                return true
            },
            {
                message: t('messages.errors.url'),
                path: ['appearanceLogoIcon']
            }
        )

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            console.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    const handleSubmit = async (
        values: z.infer<typeof formSchema>,
        dataCallback: (formData: FormData) => Promise<void>
    ) => {
        try {
            setLoading(true)
            const formData = new FormData()

            values.firstPayment = new Date(values.firstPayment).toISOString()

            formData.append('data', JSON.stringify(inEditingMode ? { ...initialData, ...values } : values))

            await dataCallback(formData)
        } catch (error) {
            handleError(error, 'Form error')
        } finally {
            setLoading(false)
        }
    }

    const handleIconChange = (newIcon: string) => {
        form.setValue('appearanceLogoIcon', newIcon)
        setIcon(newIcon)
    }

    return {
        form,
        icon,
        loading,
        handleSubmit,
        handleIconChange
    }
}
