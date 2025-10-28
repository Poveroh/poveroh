'use client'

import { Button } from '@poveroh/ui/components/button'
import { Logo } from '@poveroh/ui/components/logo'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import appConfig from '@/config'

type DefaultAuthLayout = Readonly<{
    children: React.ReactNode
}>

export default function AuthLayout({ children }: DefaultAuthLayout) {
    const t = useTranslations()
    const location = usePathname()

    useEffect(() => {
        console.log(appConfig.name, ' - ', appConfig.version, ' | api alive: ', appConfig.apiUrl)
    }, [])

    const isSignUpPage = location === '/sign-up'
    const isSignInPage = location === '/sign-in'

    return (
        <div className='flex h-screen'>
            <div className='flex flex-col items-center md:items-start w-full lg:w-1/2 h-full p-12'>
                <div className='flex flex-col w-full h-full'>
                    <div className='flex flex-row justify-between'>
                        <Link href='/sign-in'>
                            <Logo color='white' mode='horizontal' width={120} height={50}></Logo>
                        </Link>
                        {isSignUpPage && (
                            <div className='flex flex-row items-center space-x-2'>
                                <p>{t('layout.navbar.signInLink')}</p>
                                <Link href='/sign-in'>
                                    <Button size='sm' variant='secondary'>
                                        {t('signin.title')}
                                    </Button>
                                </Link>
                            </div>
                        )}
                        {isSignInPage && (
                            <div className='flex flex-row items-center space-x-2'>
                                <p>{t('layout.navbar.signUpLink')}</p>
                                <Link href='/sign-up'>
                                    <Button size='sm' variant='secondary'>
                                        {t('signup.title')}
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className='flex items-center flex-1'>{children}</div>
                </div>
            </div>
            <div className='hidden lg:flex justify-center items-center h-full w-1/2 bg-special-pattern box-rounded-just-left'></div>
        </div>
    )
}
