'use client'

import { useUserStore } from '@/store/auth.store'
import moment from 'moment-timezone'
import { DateFormatEnum, DEFAULT_USER_PREFERENCES, LanguageEnum, TimezoneEnum } from '@poveroh/types'

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
    const preferences = userStore.user.preferences ?? DEFAULT_USER_PREFERENCES

    const timezone = toIanaTimezone(preferences.timezone || 'EUROPE/ROME')
    const locale = getMomentLocale(preferences.preferredLanguage || 'EN')

    function renderDate(date: string | Date, format?: DateFormatEnum) {
        const actualFormat = format || preferences.dateFormat || 'DD/MM/YYYY'

        return moment(date).tz(timezone).locale(locale).format(actualFormat)
    }

    return {
        preferedCurrency: preferences.preferredCurrency || 'EUR',
        preferedLanguage: (preferences.preferredLanguage || 'EN').toLowerCase(),
        dateFormat: preferences.dateFormat || 'DD/MM/YYYY',
        country: preferences.country || 'italy',
        timezone,
        renderDate
    }
}
