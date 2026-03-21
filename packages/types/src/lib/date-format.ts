import { DateFormatEnum } from './contracts.js'
import { Item } from './item.js'

export const DateFormatCatalog: Item<DateFormatEnum>[] = [
    { label: 'DD/MM/YYYY', value: 'DD_MM_YYYY' },
    { label: 'MM/DD/YYYY', value: 'MM_DD_YYYY' },
    { label: 'YYYY/MM/DD', value: 'YYYY_MM_DD' },
    { label: 'DD/MM/YY', value: 'DD_MM_YY' },
    { label: 'MM/DD/YY', value: 'MM_DD_YY' },
    { label: 'YY/MM/DD', value: 'YY_MM_DD' },
    { label: 'DD MMMM YYYY', value: 'DD_MMMM_YYYY' },
    { label: 'MMMM DD, YYYY', value: 'MMMM_DD_YYYY' },
    { label: 'YYYY MMMM DD', value: 'YYYY_MMMM_DD' }
]
