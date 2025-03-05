import { Landmark, Settings, Shapes, Shield, User, WalletCards } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

type SettingsCardType = {
    link: string
    title: string
    subtitle: string
    icon: JSX.Element
}

function SettingsCard(props: SettingsCardType) {
    return (
        <Link
            href={props.link}
            className='flex flex-col space-y-10 p-10 bg-box border border-hr rounded-lg w-3/12'
        >
            {props.icon}
            <div className='flex flex-col space-y-1'>
                <p className='font-bold'>{props.title}</p>
                <p>{props.subtitle}</p>
            </div>
        </Link>
    )
}

function SettingsPage() {
    const t = useTranslations()

    return (
        <div className='space-y-12'>
            <div className='flex flex-row items-center justify-between'>
                <h2>{t('settings.title')}</h2>
            </div>
            <div className='flex flex-col space-y-5'>
                <h4>{t('settings.account.title')}</h4>
                <div className='flex flex-row space-x-5'>
                    <SettingsCard
                        link='/account/edit'
                        title={t('settings.account.personalInfo.title')}
                        subtitle={t('settings.account.personalInfo.subtitle')}
                        icon={<User />}
                    ></SettingsCard>
                    <SettingsCard
                        link='/account/security'
                        title={t('settings.account.security.title')}
                        subtitle={t('settings.account.security.subtitle')}
                        icon={<Shield />}
                    ></SettingsCard>
                </div>
            </div>
            <div className='flex flex-col space-y-5'>
                <h4>{t('settings.manage.title')}</h4>
                <div className='flex flex-row space-x-5'>
                    <SettingsCard
                        link='/bank-account'
                        title={t('settings.manage.bankAccount.title')}
                        subtitle={t('settings.manage.bankAccount.subtitle')}
                        icon={<Landmark />}
                    ></SettingsCard>
                    <SettingsCard
                        link='#'
                        title={t('settings.manage.category.title')}
                        subtitle={t('settings.manage.category.subtitle')}
                        icon={<Shapes />}
                    ></SettingsCard>
                    <SettingsCard
                        link='#'
                        title={t('settings.manage.subscriptions.title')}
                        subtitle={t('settings.manage.subscriptions.subtitle')}
                        icon={<WalletCards />}
                    ></SettingsCard>
                </div>
            </div>
            <div className='flex flex-col space-y-5'>
                <h4>{t('settings.system.title')}</h4>
                <div className='flex flex-row space-x-5'>
                    <SettingsCard
                        link='#'
                        title={t('settings.system.globalPreferences.title')}
                        subtitle={t('settings.system.globalPreferences.subtitle')}
                        icon={<Settings />}
                    ></SettingsCard>
                </div>
            </div>
            <p className='sub'>v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
        </div>
    )
}

export default SettingsPage
