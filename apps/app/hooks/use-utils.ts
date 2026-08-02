import { DateFormatEnum, Item } from '@poveroh/types'
import { useTranslations } from 'next-intl'
import { useUser } from './use-user'
import moment from 'moment'

export const useUtils = () => {
    const t = useTranslations()
    const { preferences } = useUser()

    const renderItemsLabel = (items: Item[]) => {
        return items.map(item => ({
            ...item,
            label: t(item.label)
        }))
    }

    const renderPriceLabel = (price: number) => {
        return new Intl.NumberFormat(preferences.preferredLanguage || 'it-IT', {
            style: 'currency',
            currency: preferences.preferredCurrency || 'EUR'
        }).format(price)
    }

    function renderDate(date: string | Date, format?: DateFormatEnum) {
        const actualFormat = format || preferences.dateFormat || 'DD/MM/YYYY'

        return moment(date).tz(preferences.timezone).locale(preferences.preferredLanguage).format(actualFormat)
    }

    return { renderItemsLabel, renderPriceLabel, renderDate }
}
