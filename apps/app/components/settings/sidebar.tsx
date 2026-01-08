'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent
} from '@poveroh/ui/components/sidebar'
import { SETTINGS_NAV } from '@/config/navbar'
import DynamicIcon from '../icon/dynamic-icon'

export default function SidebarSettings() {
    const t = useTranslations()
    const pathname = usePathname()

    return (
        <>
            <SidebarMenu>
                {SETTINGS_NAV.map(section => (
                    <SidebarGroup key={section.title}>
                        <SidebarGroupLabel>{t(section.title)}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            {section.items.map(item => {
                                const isActive = pathname === item.href
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link href={item.href}>
                                                <DynamicIcon name={item.icon} />
                                                <span>{t(item.title)}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarMenu>
        </>
    )
}
