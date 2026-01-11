export interface NavVisibility {
    header?: boolean
}

export interface INavItem {
    key?: string
    title: string
    href?: string
    description?: string
    show: boolean
    hasSeparator?: boolean
    visibility?: NavVisibility
    children?: INavItem[]
}
