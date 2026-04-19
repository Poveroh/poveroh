'use client'

import { SidebarSection } from '@poveroh/types'
import {
    Sidebar as ShadcnSidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger
} from '@poveroh/ui/components/sidebar'
import { Logo } from '@poveroh/ui/components/logo'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ReactNode } from 'react'
import DynamicIcon from '../icon/dynamic-icon'

type SidebarProps = {
    content: SidebarSection[]
    footer?: ReactNode
}

export function Sidebar({ content, footer }: SidebarProps) {
    const t = useTranslations()
    const pathname = usePathname()

    return (
        <ShadcnSidebar
            collapsible='icon'
            variant='floating'
            className='[&_[data-sidebar=sidebar]]:bg-box-background [&_[data-sidebar=sidebar]]:border-none [&_[data-sidebar=sidebar]]:shadow-none'
        >
            <SidebarHeader>
                <div className='flex items-center justify-between gap-2 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0'>
                    <Link href='/dashboard' className='flex items-center group-data-[collapsible=icon]:hidden'>
                        <Logo color='white' mode='horizontal' width={120} height={40} />
                    </Link>
                    <SidebarTrigger />
                </div>
            </SidebarHeader>
            <SidebarContent className='gap-2 px-2 py-4'>
                {content.map((section, index) => (
                    <SidebarGroup key={index} className='gap-2'>
                        <SidebarGroupLabel className='sub px-3 text-sm'>{t(section.title)}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className='gap-1'>
                                {section.items.map(item => {
                                    const isActive = pathname === item.href
                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                tooltip={t(item.title)}
                                                className='h-10 gap-3 px-3 text-base [&>svg]:size-5'
                                            >
                                                <Link href={item.href}>
                                                    <DynamicIcon name={item.icon} />
                                                    <span>{t(item.title)}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            {footer && <SidebarFooter>{footer}</SidebarFooter>}
        </ShadcnSidebar>
    )
}
