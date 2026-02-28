'use client'

import { useEffect } from 'react'
import { setErrorMap } from 'zod'
import { useTranslations, useLocale } from 'next-intl'

export default function ZodLocaleProvider() {
    const t = useTranslations()
    const locale = useLocale()

    useEffect(() => {
        setErrorMap((issue, ctx) => {
            if (issue.code === 'invalid_type') {
                return { message: t('messages.errors.required') }
            }

            if (issue.code === 'invalid_string') {
                if (issue.validation === 'email') return { message: t('messages.errors.email') }
                return { message: ctx.defaultError }
            }

            if (issue.code === 'too_small') {
                const min = (issue as any).minimum ?? 0
                return { message: t('messages.errors.passwordAtLeastChar', { a: min }) }
            }

            return { message: ctx.defaultError }
        })
    }, [t, locale])

    return null
}
