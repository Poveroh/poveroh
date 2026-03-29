export type Brand = {
    name: string
    logo: string
    color: string
    category: string
}

export type GroupedBrands = Record<string, Brand[]>
