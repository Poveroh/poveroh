import { SidebarSection } from '@poveroh/types'

export const MAIN_SIDEBAR: SidebarSection[] = [
    {
        title: 'dashboard.title',
        items: [
            {
                title: 'dashboard.title',
                href: '/dashboard',
                icon: 'layout-dashboard'
            },
            {
                title: 'transactions.title',
                href: '/transactions',
                icon: 'credit-card'
            },
            {
                title: 'investments.title',
                href: '/investments',
                icon: 'chart-line'
            }
        ]
    },
    {
        title: 'settings.finance.title',
        items: [
            {
                title: 'accounts.title',
                href: '/accounts',
                icon: 'landmark'
            },
            {
                title: 'categories.title',
                href: '/categories',
                icon: 'shapes'
            },
            {
                title: 'subscriptions.title',
                href: '/subscriptions',
                icon: 'repeat'
            }
        ]
    }
]

export const SETTINGS_SIDEBAR: SidebarSection[] = [
    {
        items: [
            {
                title: 'buttons.back',
                href: '/dashboard',
                icon: 'arrow-left'
            }
        ]
    },
    {
        title: 'settings.account.title',
        items: [
            {
                title: 'settings.account.personalInfo.title',
                href: '/settings/profile',
                icon: 'user'
            },
            {
                title: 'settings.account.security.title',
                href: '/settings/security',
                icon: 'shield'
            }
        ]
    },
    {
        title: 'settings.finance.title',
        items: [
            {
                title: 'settings.manage.account.title',
                href: '/accounts',
                icon: 'landmark'
            },
            {
                title: 'settings.manage.category.title',
                href: '/categories',
                icon: 'shapes'
            },
            {
                title: 'settings.manage.subscriptions.title',
                href: '/subscriptions',
                icon: 'wallet-cards'
            },
            {
                title: 'imports.title',
                href: '/imports',
                icon: 'folder-up'
            }
        ]
    },
    {
        title: 'settings.account.title',
        items: [
            {
                title: 'providers.title',
                href: '/settings/providers',
                icon: 'user'
            }
        ]
    },
    {
        title: 'settings.system.title',
        items: [
            {
                title: 'settings.system.globalPreferences.title',
                href: '/settings/preferences',
                icon: 'settings'
            }
        ]
    }
]
