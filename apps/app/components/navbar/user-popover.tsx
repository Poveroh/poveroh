'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@poveroh/ui/components/popover'
import { Button } from '@poveroh/ui/components/button'
import { useSidebar } from '@poveroh/ui/components/sidebar'
import { useTranslations } from 'next-intl'
import { LogOut, Settings } from 'lucide-react'
import { ReactNode } from 'react'
import Link from 'next/link'
import { useUser } from '@/hooks/use-user'
import Divider from '../other/divider'
import { CompanyInfoBar } from './company-info-bar'
import { User } from '@poveroh/types'

type UserPopoverContentProps = {
    user: User
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
                    <Link className='flex items-center space-x-2 w-full' href='/settings/profile'>
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
    const { state, isMobile } = useSidebar()
    const isCollapsed = state === 'collapsed' && !isMobile

    const initials = `${user.name?.[0] ?? ''}${user.surname?.[0] ?? ''}`.toUpperCase()

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='secondary' className={'w-full'} aria-label={`${user.name} ${user.surname}`}>
                    {isCollapsed ? (
                        <span className='text-xs font-semibold'>{initials}</span>
                    ) : (
                        <span className='truncate'>
                            {user.name} {user.surname}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align='end' side={isCollapsed ? 'right' : 'top'}>
                <UserPopoverContent user={user} />
            </PopoverContent>
        </Popover>
    )
}
