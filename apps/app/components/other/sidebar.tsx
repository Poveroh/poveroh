'use client'

import { ISidebarSection, ISidebarItem } from '@poveroh/types'
import { Button } from '@poveroh/ui/components/button'
import { usePathname } from 'next/navigation'
import DynamicIcon from '../icon/dynamic-icon'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

type SidebarItemProps = {
    item: ISidebarItem
    isActive: boolean
}

function SidebarItemComponent({ item, isActive }: SidebarItemProps) {
    const t = useTranslations()

    return (
        <Link href={item.href} className='w-full'>
            <Button variant={isActive ? 'active' : 'ghost'} className='w-full justify-start'>
                <DynamicIcon name={item.icon} />
                {t(item.title)}
            </Button>
        </Link>
    )
}

function SidebarGroup({ children }: { children: React.ReactNode }) {
    return <div className='px-4 py-2'>{children}</div>
}

type SidebarSectionProps = {
    section: ISidebarSection
    pathname: string
}

function SidebarSection({ section, pathname }: SidebarSectionProps) {
    const t = useTranslations()

    return (
        <SidebarGroup>
            <p className='bold sub'>{t(section.title)}</p>
            <div className='flex flex-col'>
                {section.items.map((item, itemIndex) => {
                    const isActive = pathname === item.href
                    return <SidebarItemComponent key={itemIndex} item={item} isActive={isActive} />
                })}
            </div>
        </SidebarGroup>
    )
}

type SidebarProps = {
    content: ISidebarSection[]
}

export function Sidebar({ content }: SidebarProps) {
    const pathname = usePathname()

    return (
        <div className='flex flex-col space-y-2 bg-box-background p-5 rounded-lg h-full'>
            {content.map((section, index) => (
                <SidebarSection key={index} section={section} pathname={pathname} />
            ))}
        </div>
    )
}
