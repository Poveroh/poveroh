'use client'

import { useTranslations } from 'next-intl'
import { useWatch } from 'react-hook-form'

import { Button } from '@poveroh/ui/components/button'
import { Form } from '@poveroh/ui/components/form'
import { cn } from '@poveroh/ui/lib/utils'
import type { MarketDataProvider } from '@poveroh/types'

import { PasswordField } from '@/components/fields'
import { useMarketDataProviderCredentialForm } from '@/hooks/form/use-market-data-provider-credential-form'

import { Loader2, Unlink } from 'lucide-react'
import { BrandIcon } from '../icon/brand-icon'

type Props = {
    provider: MarketDataProvider
}

// Renders a single provider row with its status, setup instructions and credential form.
export function ProviderCredentialCard({ provider }: Props) {
    const t = useTranslations()
    const { form, isSaving, isDeleting, handleSave, handleDelete } = useMarketDataProviderCredentialForm(provider)
    const apiKey = useWatch({ control: form.control, name: 'apiKey' })
    const handleSubmit = form.handleSubmit(handleSave)

    return (
        <div className='flex flex-col gap-4 py-6 first:pt-0 last:pb-0'>
            <div className='flex flex-row items-center justify-between'>
                <div className='flex flex-row items-center gap-3'>
                    <BrandIcon icon={provider.logoUrl} circled />
                    <h4 className='font-bold'>{provider.label}</h4>
                </div>
                <ProviderStatusBadge configured={provider.configured} />
            </div>

            <p className='sub whitespace-pre-line'>{t(`providers.list.${provider.id}.setup`)}</p>

            <Form {...form}>
                <form onSubmit={handleSubmit} className='flex flex-col gap-3' noValidate>
                    <PasswordField
                        control={form.control}
                        name='apiKey'
                        label={t('providers.fields.apiKey')}
                        placeholder={t('providers.fields.apiKeyPlaceholder')}
                        autoComplete='off'
                        mandatory
                    />

                    <div className='flex flex-row items-center justify-end gap-2'>
                        {provider.configured && (
                            <Button
                                type='button'
                                variant='danger'
                                onClick={handleDelete}
                                disabled={isDeleting || isSaving}
                            >
                                {isDeleting ? <Loader2 className='animate-spin mr-2' /> : <Unlink />}
                                {t('providers.actions.disconnect')}
                            </Button>
                        )}
                        <Button
                            type='button'
                            onClick={() => void handleSubmit()}
                            disabled={!apiKey?.trim() || isSaving || isDeleting}
                        >
                            {isSaving && <Loader2 className='animate-spin mr-2' />}
                            {provider.configured ? t('providers.actions.update') : t('providers.actions.connect')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

function ProviderStatusBadge({ configured }: { configured: boolean }) {
    const t = useTranslations()

    return (
        <div className={cn('flex flex-row items-center gap-2')}>
            <span className={cn('h-2 w-2 rounded-full', configured ? 'bg-emerald-500' : 'bg-muted-foreground')} />
            <p className={cn(configured ? 'text-emerald-500' : 'text-muted-foreground')}>
                {configured ? t('providers.status.configured') : t('providers.status.notConfigured')}
            </p>
        </div>
    )
}
