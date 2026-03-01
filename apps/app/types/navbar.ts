export type NavVisibility = {
    header?: boolean
}

export type NavItem = {
    key?: string
    title: string
    href?: string
    description?: string
    show: boolean
    icon?: string
    hasSeparator?: boolean
    visibility?: NavVisibility
    children?: NavItem[]
}
