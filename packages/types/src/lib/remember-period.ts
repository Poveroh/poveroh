import { RememberPeriodEnum } from './contracts.js'
import { Item } from './item.js'

export const RememberPeriodCatalog: Item<RememberPeriodEnum>[] = [
    { label: 'reminderPeriod.same_day', value: 'SAME_DAY' },
    { label: 'reminderPeriod.three_days', value: 'THREE_DAYS' },
    { label: 'reminderPeriod.seven_days', value: 'SEVEN_DAYS' },
    { label: 'reminderPeriod.fourteen_days', value: 'FOURTEEN_DAYS' },
    { label: 'reminderPeriod.thirty_days', value: 'THIRTY_DAYS' },
    { label: 'reminderPeriod.ninety_days', value: 'NINETY_DAYS' }
]
