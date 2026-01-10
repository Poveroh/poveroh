import { ReactNode } from 'react'
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from '@poveroh/ui/components/sidebar'
import SidebarSettings from '@/components/settings/sidebar'

export default function SettingsLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider className='h-full'>
            <Sidebar variant='embedded' side='left'>
                <SidebarContent>
                    <SidebarSettings />
                </SidebarContent>
            </Sidebar>
            <SidebarInset className='overflow-y-auto h-full pb-10'>{children}</SidebarInset>
        </SidebarProvider>
    )
}
