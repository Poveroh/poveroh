'use client'

import NavBar from '@/components/navbar/navbar'
import { RouteGuard } from '@/components/other/route-guard'
import { OnBoardingStep } from '@poveroh/types'
import { usePathname } from 'next/navigation'

type AppLayoutProps = {
    children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
    const pathname = usePathname()
    const isSettings = [
        '/accounts',
        '/categories',
        '/subscription',
        '/imports',
        '/settings/profile',
        '/settings/security',
        '/settings/preferences'
    ].includes(pathname)

    return (
        <RouteGuard requiredStep={[OnBoardingStep.COMPLETED]} redirectTo='/onboarding'>
            {isSettings ? (
                <div className='flex flex-col h-screen'>
                    <NavBar fixed={!isSettings} />
                    <div className={`container mx-auto flex justify-center grow px-4 overflow-hidden`}>{children}</div>
                </div>
            ) : (
                <>
                    <NavBar />
                    <div className='container mx-auto pt-40 pb-20 px-4'>{children}</div>
                </>
            )}
        </RouteGuard>
    )
}
