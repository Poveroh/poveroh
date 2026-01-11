import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle
} from '@poveroh/ui/components/navigation-menu'
import { getNavConfig } from '@/config/nav-config'
import { INavItem } from '@/types/navbar'
import { cn } from '@poveroh/ui/lib/utils'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Separator } from '@poveroh/ui/components/separator'
import Link from 'next/link'

export function NavigationBar() {
    const t = useTranslations()
    const navConfig = getNavConfig()
    const pathname = usePathname()

    const renderDropdownContent = (items: INavItem[], gridClass: string = 'w-[300px]') => (
        <ul className={cn('grid gap-xxs', gridClass)}>
            {items
                .filter(item => item.show)
                .map((item, index) => {
                    if (item.hasSeparator) {
                        return <Separator key={`separator-${index}`} />
                    }

                    const isActive = item.href ? pathname?.startsWith(item.href) : false

                    return (
                        <ListItem key={item.title} href={item.href!} title={t(item.title)} isActive={isActive}>
                            {item.description && t(item.description)}
                        </ListItem>
                    )
                })}
        </ul>
    )

    const getGridClass = (itemsCount: number) => {
        if (itemsCount <= 4) return 'w-[300px]'
        if (itemsCount <= 6) return 'w-[400px] gap-x3s md:w-[500px] md:grid-cols-2'
        return 'w-[400px] gap-x3s md:w-[500px] md:grid-cols-2 lg:w-[600px]'
    }

    return (
        <NavigationMenu>
            <NavigationMenuList>
                {navConfig
                    .filter(menuItem => menuItem.show)
                    .map((menuItem, index) => (
                        <NavigationMenuItem key={`${menuItem.title}-${index}`}>
                            {menuItem.children && menuItem.children.length > 0 ? (
                                <>
                                    <NavigationMenuTrigger>{t(menuItem.title)}</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        {renderDropdownContent(
                                            menuItem.children.filter(item => item.show),
                                            getGridClass(
                                                menuItem.children.filter(item => item.show && !item.hasSeparator).length
                                            )
                                        )}
                                    </NavigationMenuContent>
                                </>
                            ) : (
                                <NavigationMenuLink
                                    asChild
                                    className={navigationMenuTriggerStyle()}
                                    data-active={pathname === menuItem.href}
                                >
                                    <Link href={menuItem.href!} className={cn('inline-block')}>
                                        {t(menuItem.title)}
                                    </Link>
                                </NavigationMenuLink>
                            )}
                        </NavigationMenuItem>
                    ))}
            </NavigationMenuList>
        </NavigationMenu>
    )
}

type ListItemProps = React.ComponentPropsWithoutRef<'li'> & {
    href: string
    title: string
    children?: React.ReactNode
    isActive?: boolean
}

function ListItem({ title, children, href, isActive, ...props }: ListItemProps) {
    return (
        <li {...props}>
            <NavigationMenuLink asChild data-active={isActive} active={isActive}>
                <Link href={href} className={cn('w-fit')}>
                    <div className='text-base leading-none font-bold'>{title}</div>
                    {children && <p className='sub break-words whitespace-normal'>{children}</p>}
                </Link>
            </NavigationMenuLink>
        </li>
    )
}
