'use client'

import { Logo } from '@poveroh/ui/components/logo'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'
import { useEffect, useState } from 'react'

const NotFoundPage = () => {
    const t = useTranslations()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return <div>Loading...</div>
    }

    return (
        <>
            <div className='flex h-screen w-screen items-center justify-center'>
                <div className='flex flex-col items-center space-y-20'>
                    <Logo color='white' mode='horizontal' width={120} height={50}></Logo>
                    <div className='flex flex-col items-center justify-center '>
                        <h1 className='text-4xl font-bold mb-4'>{t('notFound.title')}</h1>
                        <p className='text-lg mb-6'>{t('notFound.description')}</p>
                        <Link href='/'>{t('buttons.returnHome')}</Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NotFoundPage
