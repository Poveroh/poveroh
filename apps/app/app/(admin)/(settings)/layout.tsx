import { ReactNode } from 'react'
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from '@poveroh/ui/components/sidebar'
import SidebarSettings from '@/components/settings/sidebar'

export default function SettingsLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <Sidebar variant='embedded' side='left'>
                <SidebarContent>
                    <SidebarSettings />
                </SidebarContent>
            </Sidebar>
            <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
    )
}
