import { IItem } from './item.js'

export enum DateFormat {
    DD_MM_YYYY = 'DD_MM_YYYY',
    MM_DD_YYYY = 'MM_DD_YYYY',
    YYYY_MM_DD = 'YYYY_MM_DD',
    DD_MM_YY = 'DD_MM_YY',
    MM_DD_YY = 'MM_DD_YY',
    YY_MM_DD = 'YY_MM_DD',
    DD_MMMM_YYYY = 'DD_MMMM_YYYY',
    MMMM_DD_YYYY = 'MMMM_DD_YYYY',
    YYYY_MMMM_DD = 'YYYY_MMMM_DD'
}

export const dateFormatCatalog: IItem[] = Object.values(DateFormat).map(dateFormat => ({
    label: dateFormat,
    value: dateFormat
}))
