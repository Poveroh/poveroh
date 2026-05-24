'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import { Form } from '@poveroh/ui/components/form'

import Box from '@/components/box/box-wrapper'
import { PageWrapper } from '@/components/box/page-wrapper'
import { Header } from '@/components/other/header-page'
import SkeletonItem from '@/components/skeleton/skeleton-item'
import { ProviderCredentialCard } from '@/components/provider/provider-credential-card'

import { useMarketDataProvider } from '@/hooks/use-market-data-provider'
import { useUser } from '@/hooks/use-user'
import { SelectField } from '@/components/fields'
import { useProvidersForm } from '@/hooks/form/use-providers-form'
import { Button } from '@poveroh/ui/components/button'
import { Loader2 } from 'lucide-react'
import { DEFAULT_MARKET_DATA_PROVIDER } from '@poveroh/types'

export default function ProvidersView() {
    const t = useTranslations()
    const { user } = useUser()
    const { providersQuery, providers } = useMarketDataProvider()

    // Yahoo Finance is always available; configured API providers are appended as explicit alternatives.
    const configuredProviders = useMemo(() => providers.filter(provider => provider.configured), [providers])
    const providerOptions = useMemo(() => {
        const preferredProvider = providers.find(provider => provider.id === user.preferredMarketDataProviderId)
        const options = [DEFAULT_MARKET_DATA_PROVIDER, ...configuredProviders]

        if (preferredProvider && !options.some(provider => provider.id === preferredProvider.id)) {
            options.push(preferredProvider)
        }

        return options
    }, [configuredProviders, providers, user.preferredMarketDataProviderId])
    const providerOptionIds = useMemo(() => providerOptions.map(provider => provider.id), [providerOptions])

    const { form, canSave, isSaving, handleSubmit } = useProvidersForm(providerOptionIds)

    if (providersQuery.isPending) {
        return (
            <PageWrapper>
                <Header
                    title={t('providers.title')}
                    titleSize='compact'
                    breadcrumbs={[
                        { label: t('settings.title') },
                        { label: t('providers.breadcrumb.advanced') },
                        { label: t('providers.title') }
                    ]}
                />
                <SkeletonItem repeat={3} />
            </PageWrapper>
        )
    }

    return (
        <PageWrapper>
            <Header
                title={t('providers.title')}
                titleSize='compact'
                breadcrumbs={[
                    { label: t('settings.title') },
                    { label: t('providers.breadcrumb.advanced') },
                    { label: t('providers.title') }
                ]}
            />

            <Box title={t('providers.select.title')} subtitle={t('providers.select.subtitle')} noDivide>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-3'>
                        <SelectField
                            control={form.control}
                            name='selectedProviderId'
                            placeholder={t('providers.select.placeholder')}
                            options={providerOptions}
                            getOptionLabel={provider => provider.label}
                            getOptionValue={provider => provider.id}
                            disabled={isSaving}
                        />
                        <div className='flex flex-row justify-end w-full'>
                            <Button type='submit' disabled={!canSave} className='w-fit'>
                                {isSaving && <Loader2 className='animate-spin mr-2' />}
                                {t('buttons.save')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </Box>

            <Box title={t('providers.list.title')}>
                {providers.map(provider => (
                    <ProviderCredentialCard key={provider.id} provider={provider} />
                ))}
            </Box>
        </PageWrapper>
    )
}
