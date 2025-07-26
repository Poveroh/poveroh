'use client'

import { useError } from './useError'
import { SubscriptionService } from '@/services/subscriptions.service'
import { useSubscriptionStore } from '@/store/subscriptions.store'
import { LoadingState } from '@/types'
import { CyclePeriod, ISubscription, ISubscriptionFilters } from '@poveroh/types'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export const useSubscription = () => {
    const t = useTranslations()
    const { handleError } = useError()

    const subscriptionService = new SubscriptionService()
    const subscriptionStore = useSubscriptionStore()

    const [subscriptionLoading, setSubscriptionLoading] = useState<LoadingState>({
        add: false,
        edit: false,
        remove: false,
        get: false,
        fetch: false
    })

    const setLoadingFor = (key: keyof LoadingState, value: boolean) => {
        setSubscriptionLoading(prev => ({ ...prev, [key]: value }))
    }

    const addSubscription = async (data: FormData) => {
        setLoadingFor('add', true)
        try {
            const res = await subscriptionService.add(data)
            subscriptionStore.addSubscription(res)
            return res
        } catch (error) {
            return handleError(error, 'Error adding subscription')
        } finally {
            setLoadingFor('add', false)
        }
    }

    const editSubscription = async (id: string, data: FormData) => {
        setLoadingFor('edit', true)
        try {
            const res = await subscriptionService.save(id, data)
            subscriptionStore.editSubscription(res)
            return res
        } catch (error) {
            return handleError(error, 'Error editing subscription')
        } finally {
            setLoadingFor('edit', false)
        }
    }

    const removeSubscription = async (subscriptionId: string) => {
        setLoadingFor('remove', true)
        try {
            const res = await subscriptionService.delete(subscriptionId)
            if (!res) throw new Error('No response from server')
            subscriptionStore.removeSubscription(subscriptionId)
            return res
        } catch (error) {
            return handleError(error, 'Error deleting subscription')
        } finally {
            setLoadingFor('remove', false)
        }
    }

    const getSubscription = async (subscriptionId: string, fetchFromServer?: boolean) => {
        setLoadingFor('get', true)
        try {
            return fetchFromServer
                ? await subscriptionService.read<ISubscription | null, ISubscriptionFilters>({ id: subscriptionId })
                : subscriptionStore.getSubscription(subscriptionId)
        } catch (error) {
            return handleError(error, 'Error fetching subscription')
        } finally {
            setLoadingFor('get', false)
        }
    }

    const fetchSubscriptions = async () => {
        setLoadingFor('fetch', true)
        try {
            const res = await subscriptionService.read<ISubscription[], ISubscriptionFilters>()
            subscriptionStore.setSubscriptions(res)
            return res
        } catch (error) {
            return handleError(error, 'Error fetching subscriptions')
        } finally {
            setLoadingFor('fetch', false)
        }
    }

    const getNextExecutionText = (subscription: ISubscription, fromDate: Date = new Date()) => {
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
        subscriptionCacheList: subscriptionStore.subscriptionCacheList,
        subscriptionLoading,
        addSubscription,
        editSubscription,
        removeSubscription,
        getSubscription,
        getNextExecutionText,
        fetchSubscriptions
    }
}
