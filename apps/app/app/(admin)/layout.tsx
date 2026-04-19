'use client'

import { RouteGuard } from '@/components/other/route-guard'
import { Sidebar } from '@/components/other/sidebar'
import { UserPopover } from '@/components/navbar/user-popover'
import { MAIN_SIDEBAR, SETTINGS_SIDEBAR } from '@/config/sidebar'
import { SidebarInset, SidebarProvider } from '@poveroh/ui/components/sidebar'
import { usePathname } from 'next/navigation'

type AppLayoutProps = {
    children: React.ReactNode
}

const SETTINGS_PATHS = [
    '/accounts',
    '/categories',
    '/imports',
    '/settings/profile',
    '/settings/security',
    '/settings/preferences'
]

export default function AppLayout({ children }: AppLayoutProps) {
    const pathname = usePathname()
    const isSettings = SETTINGS_PATHS.some(path => pathname.startsWith(path))
    const content = isSettings ? SETTINGS_SIDEBAR : MAIN_SIDEBAR

    return (
        <RouteGuard requiredStep={['COMPLETED']} redirectTo='/onboarding'>
            <SidebarProvider>
                <Sidebar
                    content={content}
                    footer={
                        <div className='flex flex-col gap-2 p-2'>
                            <UserPopover />
                        </div>
                    }
                />
                <SidebarInset>
                    <div className='flex-1 overflow-y-auto'>
                        <div className='container mx-auto px-4 py-6'>{children}</div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </RouteGuard>
    )
}
