'use client'

import { getSubscriptionsOptions } from '@/api/@tanstack/react-query.gen'
import type { Subscription } from '@/lib/api-client'
import { useSubscriptionStore } from '@/store/subscriptions.store'
import { CyclePeriod } from '@poveroh/types'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useError } from './use-error'

export const useSubscription = () => {
    const t = useTranslations()
    const { handleError } = useError()

    const { subscriptionCacheList, setSubscriptions } = useSubscriptionStore()

    const getSubscriptions = useQuery({
        ...getSubscriptionsOptions(),
        enabled: false
    })

    useEffect(() => {
        if (getSubscriptions.data) {
            setSubscriptions(getSubscriptions.data)
        }
    }, [getSubscriptions.data, setSubscriptions])

    useEffect(() => {
        if (getSubscriptions.error) {
            handleError(getSubscriptions.error)
        }
    }, [getSubscriptions.error, handleError])

    const fetchSubscriptions = async () => {
        const result = await getSubscriptions.refetch()
        if (result.data) {
            setSubscriptions(result.data)
        }
        if (result.error) {
            handleError(result.error)
        }
        return result.data ?? null
    }

    const subscriptionLoading = getSubscriptions.isFetching

    const getNextExecutionText = (subscription: Subscription, fromDate: Date = new Date()) => {
        const now = fromDate
        const next = new Date(subscription.firstPayment)

        const cycleNumber = Number(subscription.cycleNumber)

        while (next < now) {
            switch (subscription.cyclePeriod) {
                case CyclePeriod.DAY:
                    next.setDate(next.getDate() + cycleNumber)
                    break
                case CyclePeriod.WEEK:
                    next.setDate(next.getDate() + 7 * cycleNumber)
                    break
                case CyclePeriod.MONTH:
                    next.setMonth(next.getMonth() + cycleNumber)
                    break
                case CyclePeriod.YEAR:
                    next.setFullYear(next.getFullYear() + cycleNumber)
                    break
            }
        }

        const msDiff = next.getTime() - now.getTime()
        const days = Math.ceil(msDiff / (1000 * 60 * 60 * 24))

        if (days === 0) {
            return t('format.today')
        }
        if (days === 1) {
            return t('format.tomorrow')
        }
        if (days < 7) {
            return t('format.inLabel', {
                a: days,
                b: t('format.day').toLocaleLowerCase()
            })
        }
        if (days < 30) {
            return t('format.inLabel', {
                a: Math.round(days / 7),
                b: t('format.week').toLocaleLowerCase()
            })
        }
        if (days < 365) {
            return t('format.inLabel', {
                a: Math.round(days / 30),
                b: t('format.month').toLocaleLowerCase()
            })
        }

        return t('format.inLabel', {
            a: Math.round(days / 365),
            b: t('format.year').toLocaleLowerCase()
        })
    }

    return {
        subscriptionCacheList,
        subscriptionLoading,
        fetchSubscriptions,
        // addSubscription,
        // editSubscription,
        // removeSubscription,
        // getSubscription,
        getNextExecutionText
        // fetchSubscriptions
    }
}
