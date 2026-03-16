import { Item } from '@poveroh/types'
import { useTranslations } from 'next-intl'

export const useUtils = () => {
    const t = useTranslations()

    const renderItemsLabel = (items: Item[]) => {
        return items.map(item => ({
            ...item,
            label: t(item.label)
        }))
    }

    return { renderItemsLabel }
}
