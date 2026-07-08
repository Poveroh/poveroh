import { ColSpanEnum } from '@poveroh/types'

export const colSpanClass = (span: ColSpanEnum) => {
    switch (Number(span)) {
        case 3:
            return 'col-span-12 md:col-span-3'
        case 4:
            return 'col-span-12 md:col-span-4'
        case 6:
            return 'col-span-12 md:col-span-6'
        case 12:
        default:
            return 'col-span-12'
    }
}
