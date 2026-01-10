'use client'

import NavBar from '@/components/navbar/navbar'
import { RouteGuard } from '@/components/other/route-guard'
import { OnBoardingStep } from '@poveroh/types'
import { cn } from '@poveroh/ui/lib/utils'
import { usePathname } from 'next/navigation'

type AppLayoutProps = {
    children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
    const pathname = usePathname()
    const isSettings = [
        '/accounts',
        '/categories',
        '/imports',
        '/settings/profile',
        '/settings/security',
        '/settings/preferences'
    ].some(path => pathname.startsWith(path))

    return (
        <RouteGuard requiredStep={[OnBoardingStep.COMPLETED]} redirectTo='/onboarding'>
            <div className='grid grid-rows-[auto_1fr] h-screen overflow-hidden'>
                <NavBar />
                <div className={isSettings ? 'h-full overflow-hidden' : 'overflow-y-auto'}>
                    <div className={cn('container mx-auto px-4 pb-10', isSettings && 'h-full')}>{children}</div>
                </div>
            </div>
        </RouteGuard>
    )
}
