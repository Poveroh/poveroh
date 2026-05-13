'use client'

import { useUserStore } from '@/store/auth.store'
import moment from 'moment-timezone'
import { DateFormatEnum, LanguageEnum, TimezoneEnum } from '@poveroh/types'

// Convert Timezone enum to IANA timezone identifier
function toIanaTimezone(timezone: TimezoneEnum): string {
    switch (timezone) {
        case 'ETC_UTC':
            return 'UTC'
        case 'ETC_GMT_PLUS_12':
            return 'Etc/GMT+12'
        default:
            return timezone
                .replace(/_/g, '/')
                .split('/')
                .map(part =>
                    part
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ')
                )
                .join('/')
    }
}

// Map Language enum to moment.js locale
function getMomentLocale(language: LanguageEnum): string {
    switch (language) {
        case 'IT':
            return 'it'
        case 'EN':
            return 'en-gb'
        default:
            return 'en-gb'
    }
}

export const useConfig = () => {
    const userStore = useUserStore()

    const timezone = toIanaTimezone(userStore.user.timezone || 'EUROPE/ROME')
    const locale = getMomentLocale(userStore.user.preferredLanguage || 'EN')

    function renderDate(date: string | Date, format?: DateFormatEnum) {
        const actualFormat = format || userStore.user.dateFormat || 'DD/MM/YYYY'

        return moment(date).tz(timezone).locale(locale).format(actualFormat)
    }

    return {
        preferedCurrency: userStore.user.preferredCurrency || 'EUR',
        preferedLanguage: (userStore.user.preferredLanguage || 'EN').toLowerCase(),
        dateFormat: userStore.user.dateFormat || 'DD/MM/YYYY',
        country: userStore.user.country || 'italy',
        timezone,
        renderDate
    }
}
