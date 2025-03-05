import { UserPopover } from '@/components/popover/userPopover'
import { Logo } from '@poveroh/ui/components/logo'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

type AppLayoutProps = Readonly<{
    children: React.ReactNode
}>

export default function AppLayout({ children }: AppLayoutProps) {
    const t = useTranslations()

    return (
        <>
            <div className='nav-app fixed flex justify-center w-full'>
                <div className='container flex justify-between items-center space-x-6 pt-10 pb-10'>
                    <div className='flex space-x-20 items-center'>
                        <Link href='/dashboard'>
                            <Logo color='white' mode='horizontal' width={120} height={50}></Logo>
                        </Link>
                        <div className='flex flex-row space-x-6'>
                            <Link href='/transactions'>{t('transactions.title')}</Link>
                            <Link href=''>{t('subscriptions.title')}</Link>
                            <Link href=''>{t('investments.title')}</Link>
                            <Link href=''>{t('reports.title')}</Link>
                        </div>
                    </div>
                    <div className='hidden items-center space-x-6 lg:flex'>
                        <UserPopover />
                    </div>
                </div>
            </div>
            <div className='w-full flex justify-center'>
                <div className='container pt-40 pb-20'>{children}</div>
            </div>
        </>
    )
}
