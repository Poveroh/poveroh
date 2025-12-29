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

export const formatMap: Record<DateFormat, string> = {
    [DateFormat.DD_MM_YYYY]: 'DD/MM/YYYY',
    [DateFormat.MM_DD_YYYY]: 'MM/DD/YYYY',
    [DateFormat.YYYY_MM_DD]: 'YYYY/MM/DD',
    [DateFormat.DD_MM_YY]: 'DD/MM/YY',
    [DateFormat.MM_DD_YY]: 'MM/DD/YY',
    [DateFormat.YY_MM_DD]: 'YY/MM/DD',
    [DateFormat.DD_MMMM_YYYY]: 'DD MMMM YYYY',
    [DateFormat.MMMM_DD_YYYY]: 'MMMM DD, YYYY',
    [DateFormat.YYYY_MMMM_DD]: 'YYYY MMMM DD'
}

export const dateFormatCatalog: IItem[] = Object.values(DateFormat).map(dateFormat => ({
    label: formatMap[dateFormat],
    value: dateFormat
}))
