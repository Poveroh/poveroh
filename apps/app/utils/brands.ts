import { GroupedBrands, IBrand } from '@poveroh/types'

export function groupBrandByCategory(brands: IBrand[]): GroupedBrands {
    return brands.reduce((acc, brand) => {
        const category = brand.category
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(brand)
        return acc
    }, {} as GroupedBrands)
}
