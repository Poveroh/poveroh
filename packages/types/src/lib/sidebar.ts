export type SidebarItem = {
    title: string
    href: string
    icon: string
}

export type SidebarSection = {
    title: string
    items: SidebarItem[]
}
