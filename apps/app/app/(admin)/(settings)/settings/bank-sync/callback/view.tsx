'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'

import { PageWrapper } from '@/components/box/page-wrapper'
import { useBankSyncConnections } from '@/hooks/use-bank-sync-connections'

export default function BankSyncCallbackView() {
    const t = useTranslations()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { completeConnectionMutation } = useBankSyncConnections()
    const [error, setError] = useState(false)
    const started = useRef(false)

    useEffect(() => {
        if (started.current) return
        started.current = true

        const connectionId = searchParams.get('connectionId')
        if (!connectionId) {
            setError(true)
            return
        }

        const callbackPayload: Record<string, string> = {}
        searchParams.forEach((value, key) => {
            if (key !== 'connectionId' && key !== 'providerId') callbackPayload[key] = value
        })

        completeConnectionMutation
            .mutateAsync({ path: { connectionId }, body: { callbackPayload } })
            .then(() => router.replace('/settings/bank-sync'))
            .catch(() => setError(true))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <PageWrapper>
            <div className='flex flex-col items-center justify-center gap-3 py-24'>
                {error ? (
                    <p className='text-destructive'>{t('bankSync.callback.error')}</p>
                ) : (
                    <Loader2 className='animate-spin' />
                )}
                {!error && <p className='sub'>{t('bankSync.callback.processing')}</p>}
            </div>
        </PageWrapper>
    )
}
