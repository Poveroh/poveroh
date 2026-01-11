export const SETTINGS_SIDEBAR = [
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
        title: 'settings.manage.title',
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
