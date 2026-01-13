export function formatNumber(value: number, locale = 'it-IT') {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value)
}
