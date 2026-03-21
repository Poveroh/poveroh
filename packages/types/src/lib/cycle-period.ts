import { CyclePeriodEnum } from './contracts.js'
import { Item } from './item.js'

export const CyclePeriodCatalog: Item<CyclePeriodEnum>[] = [
    { label: 'format.day', value: 'DAY' },
    { label: 'format.week', value: 'WEEK' },
    { label: 'format.month', value: 'MONTH' },
    { label: 'format.year', value: 'YEAR' }
]
