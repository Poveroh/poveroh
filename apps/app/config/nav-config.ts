import { NavItem } from '@/types/navbar'

export const BASE_NAV_CONFIG: NavItem[] = [
    {
        title: 'transactions.title',
        href: '/transactions',
        show: true,
        icon: 'credit-card',
        visibility: { header: true },
        children: []
    },
    {
        title: 'subscriptions.title',
        href: '/subscriptions',
        icon: 'repeat',
        show: true,
        visibility: { header: true },
        children: []
    }
]

export function getNavConfig(): NavItem[] {
    function filterItems(items: NavItem[]): NavItem[] {
        return items
            .filter(item => item.show && item.visibility?.header)
            .map(item => ({
                ...item,
                children: item.children ? filterItems(item.children) : undefined
            }))
    }
    return filterItems(BASE_NAV_CONFIG)
}
