'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@poveroh/ui/components/popover'
import { Button } from '@poveroh/ui/components/button'
import { useUser } from '@/hooks/useUser'
import { useTranslations } from 'next-intl'
import { LogOut, Settings } from 'lucide-react'
import { useState } from 'react'

export function UserPopover() {
    const t = useTranslations()
    const { user } = useUser()

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='secondary'>
                    {user.name} {user.surname}
                </Button>
            </PopoverTrigger>
            <PopoverContent align='end'>
                <div className='flex flex-col space-y-5 w-[200px]'>
                    <div className='space-y-2'>
                        <p className='font-bold'>
                            {user.name} {user.surname}
                        </p>
                        <p className='font-bold sub'>{user.email}</p>
                    </div>
                    <hr />
                    <div className='flex flex-col space-y-5'>
                        <a className='flex items-center space-x-2 w-full' href='/settings'>
                            <Settings />
                            <p>{t('settings.title')}</p>
                        </a>
                        <a className='flex items-center space-x-2 w-full danger-all' href='/logout'>
                            <LogOut />
                            <p>{t('logout.title')}</p>
                        </a>
                    </div>
                    <hr />
                    <div className='flex space-x-2'>
                        <p className='sub small'>Poveroh &#64; 2024</p>
                        <p className='sub small'>&bull;</p>
                        <p className='sub small'>v1.0.0</p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
