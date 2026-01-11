import { INavItem } from '@/types/navbar'

export const BASE_NAV_CONFIG: INavItem[] = [
    {
        title: 'transactions.title',
        href: '/transactions',
        show: true,
        visibility: { header: true },
        children: []
    },
    {
        title: 'subscriptions.title',
        href: '/subscriptions',
        show: true,
        visibility: { header: true },
        children: []
    }
]

export function getNavConfig(): INavItem[] {
    function filterItems(items: INavItem[]): INavItem[] {
        return items
            .filter(item => item.show && item.visibility?.header)
            .map(item => ({
                ...item,
                children: item.children ? filterItems(item.children) : undefined
            }))
    }
    return filterItems(BASE_NAV_CONFIG)
}
