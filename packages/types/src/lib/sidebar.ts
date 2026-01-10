export interface ISidebarItem {
    title: string
    href: string
    icon: string
}

export interface ISidebarSection {
    title: string
    items: ISidebarItem[]
}
