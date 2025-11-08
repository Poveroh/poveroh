import { Card } from '@/components/card/card'
import appConfig from '@/config'
import { FolderUp, Landmark, Settings, Shapes, Shield, User, WalletCards } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React, { ReactNode, ReactElement } from 'react'

type SettingsCardType = {
    link: string
    title: string
    subtitle: string
    icon: ReactElement
}

function SettingsCard(props: SettingsCardType) {
    return (
        <Link href={props.link} className='h-full w-full'>
            <Card {...props}></Card>
        </Link>
    )
}

function SettingsRow({ children }: { children: ReactNode }) {
    return <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>{children}</div>
}

export default function SettingsPage() {
    const t = useTranslations()

    return (
        <div className='space-y-12'>
            <div className='flex flex-row items-center justify-between'>
                <h2>{t('settings.title')}</h2>
            </div>
            <div className='flex flex-col space-y-5'>
                <h4>{t('settings.account.title')}</h4>
                <SettingsRow>
                    <SettingsCard
                        link='/settings/account/profile'
                        title={t('settings.account.personalInfo.title')}
                        subtitle={t('settings.account.personalInfo.subtitle')}
                        icon={<User />}
                    ></SettingsCard>
                    <SettingsCard
                        link='/settings/account/security'
                        title={t('settings.account.security.title')}
                        subtitle={t('settings.account.security.subtitle')}
                        icon={<Shield />}
                    ></SettingsCard>
                </SettingsRow>
            </div>
            <div className='flex flex-col space-y-5'>
                <h4>{t('settings.manage.title')}</h4>
                <SettingsRow>
                    <SettingsCard
                        link='/accounts'
                        title={t('settings.manage.account.title')}
                        subtitle={t('settings.manage.account.subtitle')}
                        icon={<Landmark />}
                    ></SettingsCard>
                    <SettingsCard
                        link='/categories'
                        title={t('settings.manage.category.title')}
                        subtitle={t('settings.manage.category.subtitle')}
                        icon={<Shapes />}
                    ></SettingsCard>
                    <SettingsCard
                        link='/subscriptions'
                        title={t('settings.manage.subscriptions.title')}
                        subtitle={t('settings.manage.subscriptions.subtitle')}
                        icon={<WalletCards />}
                    ></SettingsCard>
                    <SettingsCard
                        link='/imports'
                        title={t('imports.title')}
                        subtitle={t('imports.subtitle')}
                        icon={<FolderUp />}
                    ></SettingsCard>
                </SettingsRow>
            </div>
            <div className='flex flex-col space-y-5'>
                <h4>{t('settings.system.title')}</h4>
                <SettingsRow>
                    <SettingsCard
                        link='#'
                        title={t('settings.system.globalPreferences.title')}
                        subtitle={t('settings.system.globalPreferences.subtitle')}
                        icon={<Settings />}
                    ></SettingsCard>
                </SettingsRow>
            </div>
            <p className='sub'>v{appConfig.version}</p>
        </div>
    )
}
