'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@poveroh/ui/components/popover'
import { Button } from '@poveroh/ui/components/button'
import { useTranslations } from 'next-intl'
import { LogOut, Settings } from 'lucide-react'
import { IUser } from '@poveroh/types'
import { ReactNode } from 'react'
import Link from 'next/link'
import { useUser } from '@/hooks/use-user'
import Divider from '../other/divider'
import { CompanyInfoBar } from './company-info-bar'

type UserPopoverContentProps = {
    user: IUser
    link?: ReactNode
}

export function UserPopoverContent({ user, link }: UserPopoverContentProps) {
    const t = useTranslations()
    return (
        <>
            <div className='flex flex-col space-y-5'>
                <div className='space-y-2'>
                    <p className='font-bold'>
                        {user.name} {user.surname}
                    </p>
                    <p className='font-bold sub'>{user.email}</p>
                </div>
                <Divider />
                {link && (
                    <>
                        {link}
                        <Divider />
                    </>
                )}
                <div className='flex flex-col space-y-5'>
                    <Link className='flex items-center space-x-2 w-full' href='/settings'>
                        <Settings />
                        <p>{t('settings.title')}</p>
                    </Link>
                    <a className='flex items-center space-x-2 w-full danger-all' href='/logout'>
                        <LogOut />
                        <p>{t('logout.title')}</p>
                    </a>
                </div>
                <Divider />
                <CompanyInfoBar small />
            </div>
        </>
    )
}

export function UserPopover() {
    const { user } = useUser()

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='secondary'>
                    {user.name} {user.surname}
                </Button>
            </PopoverTrigger>
            <PopoverContent align='end'>
                <UserPopoverContent user={user} />
            </PopoverContent>
        </Popover>
    )
}
