'use client'

import { useEffect } from 'react'
import { setErrorMap, ZodIssueCode } from 'zod'
import { useTranslations, useLocale } from 'next-intl'

export default function ZodLocaleProvider() {
    const t = useTranslations()
    const locale = useLocale()

    useEffect(() => {
        setErrorMap(((issue: any) => {
            if (issue.code === ZodIssueCode.invalid_type) {
                return { message: t('messages.errors.required') }
            }

            if (issue.code === ZodIssueCode.invalid_format) {
                if (issue.format === 'email') return { message: t('messages.errors.email') }
                return undefined
            }

            if (issue.code === ZodIssueCode.too_small) {
                const min = issue.minimum ?? 0
                return { message: t('messages.errors.passwordAtLeastChar', { a: min }) }
            }

            return undefined
        }) as any)
    }, [t, locale])

    return null
}
