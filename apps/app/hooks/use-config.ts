'use client'

import { useUserStore } from '@/store/auth.store'
import { Currencies, DateFormat, Language, Timezone } from '@poveroh/types/dist'
import { useMemo } from 'react'

// Convert Timezone enum to IANA timezone identifier
function toIanaTimezone(timezone: Timezone): string {
    switch (timezone) {
        case Timezone.ETC_UTC:
            return 'UTC'
        case Timezone.ETC_GMT_PLUS_12:
            return 'Etc/GMT+12'
        // Add other special cases as needed
        default:
            // Convert from enum format (e.g., AMERICA_NEW_YORK) to IANA format (e.g., America/New_York)
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

export const useConfig = () => {
    const userStore = useUserStore()

    // Cache formatters and month names based on language and timezone
    const { formatters, monthNames, formatMap, timezone } = useMemo(() => {
        const language = (userStore.user.preferredLanguage || Language.EN).toLowerCase()
        const timezone = toIanaTimezone(userStore.user.timezone || Timezone.EUROPE_ROME)

        const formatters = {
            dayFormatter: new Intl.DateTimeFormat(language, { day: '2-digit', timeZone: timezone }),
            monthFormatter: new Intl.DateTimeFormat(language, { month: '2-digit', timeZone: timezone }),
            yearFormatter: new Intl.DateTimeFormat(language, { year: 'numeric', timeZone: timezone }),
            yearShortFormatter: new Intl.DateTimeFormat(language, { year: '2-digit', timeZone: timezone }),
            monthNumericFormatter: new Intl.DateTimeFormat(language, { month: 'numeric', timeZone: timezone })
        }

        const monthNamesArray: string[] = []
        for (let i = 0; i < 12; i++) {
            const tempDate = new Date(2000, i, 1)
            const formatter = new Intl.DateTimeFormat(language, { month: 'long', timeZone: timezone })
            monthNamesArray.push(formatter.format(tempDate))
        }

        const formatMap: Record<DateFormat, string> = {
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

        return { formatters, monthNames: monthNamesArray, formatMap, timezone }
    }, [userStore.user.preferredLanguage, userStore.user.timezone])

    function renderDate(date: string | Date, format?: DateFormat) {
        const dateObj = typeof date === 'string' ? new Date(date) : date

        if (isNaN(dateObj.getTime())) {
            return 'Invalid Date'
        }

        const actualFormat = format || userStore.user.dateFormat || DateFormat.DD_MM_YYYY

        const day = formatters.dayFormatter.format(dateObj)
        const month = formatters.monthFormatter.format(dateObj)
        const year = formatters.yearFormatter.format(dateObj)
        const yearShort = formatters.yearShortFormatter.format(dateObj)
        const monthIndex = parseInt(formatters.monthNumericFormatter.format(dateObj)) - 1

        const monthName = monthNames[monthIndex]

        const template = formatMap[actualFormat] || 'DD/MM/YYYY'

        return template
            .replace('MMMM', monthName || 'January')
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year)
            .replace('YY', yearShort)
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
