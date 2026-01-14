'use client'

import { useUserStore } from '@/store/auth.store'
import { Currencies, DateFormat, Language, Timezone } from '@poveroh/types'
import moment from 'moment-timezone'
import 'moment/locale/it'
import 'moment/locale/en-gb'

// Convert Timezone enum to IANA timezone identifier
function toIanaTimezone(timezone: Timezone): string {
    switch (timezone) {
        case Timezone.ETC_UTC:
            return 'UTC'
        case Timezone.ETC_GMT_PLUS_12:
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

// Map DateFormat enum to moment.js format strings
function getMomentFormat(format: DateFormat): string {
    switch (format) {
        case DateFormat.DD_MM_YYYY:
            return 'DD/MM/YYYY'
        case DateFormat.MM_DD_YYYY:
            return 'MM/DD/YYYY'
        case DateFormat.YYYY_MM_DD:
            return 'YYYY/MM/DD'
        case DateFormat.DD_MM_YY:
            return 'DD/MM/YY'
        case DateFormat.MM_DD_YY:
            return 'MM/DD/YY'
        case DateFormat.YY_MM_DD:
            return 'YY/MM/DD'
        case DateFormat.DD_MMMM_YYYY:
            return 'DD MMMM YYYY'
        case DateFormat.MMMM_DD_YYYY:
            return 'MMMM DD, YYYY'
        case DateFormat.YYYY_MMMM_DD:
            return 'YYYY MMMM DD'
        default:
            return 'DD/MM/YYYY'
    }
}

// Map Language enum to moment.js locale
function getMomentLocale(language: Language): string {
    switch (language) {
        case Language.IT:
            return 'it'
        case Language.EN:
            return 'en-gb'
        default:
            return 'en-gb'
    }
}

export const useConfig = () => {
    const userStore = useUserStore()

    const timezone = toIanaTimezone(userStore.user.timezone || Timezone.EUROPE_ROME)
    const locale = getMomentLocale(userStore.user.preferredLanguage || Language.EN)

    function renderDate(date: string | Date, format?: DateFormat) {
        const actualFormat = format || userStore.user.dateFormat || DateFormat.DD_MM_YYYY
        const momentFormat = getMomentFormat(actualFormat)

        return moment(date).tz(timezone).locale(locale).format(momentFormat)
    }

    return {
        preferedCurrency: userStore.user.preferredCurrency || Currencies.EUR,
        preferedLanguage: (userStore.user.preferredLanguage || Language.EN).toLowerCase(),
        dateFormat: userStore.user.dateFormat || DateFormat.DD_MM_YYYY,
        country: userStore.user.country || 'italy',
        timezone,
        renderDate
    }
}
