'use client'

import { useError } from './useError'
import { SubscriptionService } from '@/services/subscriptions.service'
import { useSubscriptionsStore } from '@/store/subscriptions.store'
import { CyclePeriod, ISubscription, ISubscriptionFilters } from '@poveroh/types'
import { useTranslations } from 'next-intl'

export const useSubscriptions = () => {
    const t = useTranslations()
    const { handleError } = useError()

    const subscriptionService = new SubscriptionService()
    const subscriptionStore = useSubscriptionsStore()

    const addSubscription = async (data: FormData) => {
        try {
            const res = await subscriptionService.add(data)
            subscriptionStore.addSubscription(res)
            return res
        } catch (error) {
            return handleError(error, 'Error adding subscription')
        }
    }

    const editSubscription = async (id: string, data: FormData) => {
        try {
            const res = await subscriptionService.save(id, data)
            subscriptionStore.editSubscription(res)
            return res
        } catch (error) {
            return handleError(error, 'Error editing subscription')
        }
    }

    const removeSubscription = async (subscription_id: string) => {
        try {
            const res = await subscriptionService.delete(subscription_id)
            if (!res) throw new Error('No response from server')
            subscriptionStore.removeSubscription(subscription_id)
            return res
        } catch (error) {
            return handleError(error, 'Error deleting subscription')
        }
    }

    const getSubscription = async (subscription_id: string, fetchFromServer?: boolean) => {
        try {
            return fetchFromServer
                ? await subscriptionService.read<ISubscription | null, ISubscriptionFilters>({ id: subscription_id })
                : subscriptionStore.getSubscription(subscription_id)
        } catch (error) {
            return handleError(error, 'Error fetching subscription')
        }
    }

    const fetchSubscriptions = async () => {
        try {
            const res = await subscriptionService.read<ISubscription[], ISubscriptionFilters>()
            subscriptionStore.setSubscription(res)
            return res
        } catch (error) {
            return handleError(error, 'Error fetching subscriptions')
        }
    }

    const getNextExecutionText = (subscription: ISubscription, fromDate: Date = new Date()) => {
        const now = fromDate
        const next = new Date(subscription.first_payment)

        const cycle_number = Number(subscription.cycle_number)

        while (next < now) {
            switch (subscription.cycle_period) {
                case CyclePeriod.DAY:
                    next.setDate(next.getDate() + cycle_number)
                    break
                case CyclePeriod.WEEK:
                    next.setDate(next.getDate() + 7 * cycle_number)
                    break
                case CyclePeriod.MONTH:
                    next.setMonth(next.getMonth() + cycle_number)
                    break
                case CyclePeriod.YEAR:
                    next.setFullYear(next.getFullYear() + cycle_number)
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
        subscriptionCacheList: subscriptionStore.subscriptionCacheList,
        addSubscription,
        editSubscription,
        removeSubscription,
        getSubscription,
        getNextExecutionText,
        fetchSubscriptions
    }
}
