export interface IBrand {
    name: string
    logo: string
    color: string
    category: string
}

export type GroupedBrands = Record<string, IBrand[]>
