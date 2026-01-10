'use client'

import { UserPopover, UserPopoverContent } from '@/components/navbar/user-popover'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@poveroh/ui/components/sheet'
import { Logo } from '@poveroh/ui/components/logo'
import { AlignJustify } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { useUser } from '@/hooks/use-user'
import { cn } from '@poveroh/ui/lib/utils'

function NavBarLink({ direction }: { direction: 'row' | 'col' }) {
    const t = useTranslations()

    const xy = direction == 'row' ? 'x-6' : 'y-3'

    return (
        <div className={`flex flex-${direction} space-${xy}`}>
            {['transactions', 'subscriptions', 'investments', 'reports'].map(item => (
                <Link key={item} href={`/${item}`}>
                    {t(`${item}.title`)}
                </Link>
            ))}
        </div>
    )
}

function NavBarSideMenu() {
    const { user } = useUser()

    return (
        <Sheet>
            <SheetTrigger asChild>
                <AlignJustify className='cursor-pointer' />
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle></SheetTitle>
                </SheetHeader>
                <UserPopoverContent user={user} link={<NavBarLink direction='col' />} />
            </SheetContent>
        </Sheet>
    )
}

export default function NavBar() {
    const { width, breakpoints } = useBreakpoint()
    return (
        <>
            <div className={cn('nav-app', 'flex justify-center w-full mb-5')}>
                <div className='container flex justify-between items-center space-x-6 pt-10 pb-10 mx-auto px-4'>
                    <div className='flex space-x-20 items-center'>
                        <Link href='/dashboard'>
                            <Logo color='white' mode='horizontal' width={120} height={50}></Logo>
                        </Link>
                        {width <= breakpoints.lg ? null : <NavBarLink direction='row' />}
                    </div>

                    {width <= breakpoints.lg ? (
                        <NavBarSideMenu />
                    ) : (
                        <div className='hidden items-center space-x-6 lg:flex'>
                            <UserPopover />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
