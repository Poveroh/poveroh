'use client'

import { useIsFetching, useMutation, useQueryClient } from '@tanstack/react-query'
import { LoadingState } from '@/types/general'
import { SubscriptionData } from '@poveroh/types/contracts'
import { useError } from './use-error'
import { useSubscriptionStore } from '@/store/subscriptions.store'
import {
    createSubscriptionMutation,
    deleteSubscriptionMutation,
    getSubscriptionByIdOptions,
    getSubscriptionByIdQueryKey,
    getSubscriptionsOptions,
    getSubscriptionsQueryKey,
    updateSubscriptionMutation
} from '@/api/@tanstack/react-query.gen'

const addCycle = (date: Date, cycleNumber: number, cyclePeriod: string): Date => {
    const next = new Date(date)

    switch ((cyclePeriod || '').toUpperCase()) {
        case 'DAY':
            next.setDate(next.getDate() + cycleNumber)
            return next
        case 'WEEK':
            next.setDate(next.getDate() + cycleNumber * 7)
            return next
        case 'YEAR':
            next.setFullYear(next.getFullYear() + cycleNumber)
            return next
        case 'MONTH':
        default:
            next.setMonth(next.getMonth() + cycleNumber)
            return next
    }
}

export const useSubscription = () => {
    const queryClient = useQueryClient()
    const { handleError } = useError()
    const subscriptionStore = useSubscriptionStore()

    const createMutation = useMutation({
        ...createSubscriptionMutation(),
        onSuccess: data => {
            const subscription = data?.data as SubscriptionData | undefined
            if (subscription) {
                subscriptionStore.addSubscription(subscription)
            }
            queryClient.invalidateQueries({ queryKey: getSubscriptionsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error adding subscription')
        }
    })

    const updateMutation = useMutation({
        ...updateSubscriptionMutation(),
        onSuccess: (data, variables) => {
            const subscription = (data?.data ?? variables.body) as SubscriptionData | undefined
            if (subscription) {
                subscriptionStore.editSubscription(subscription)
            }

            queryClient.invalidateQueries({ queryKey: getSubscriptionsQueryKey() })
            queryClient.invalidateQueries({
                queryKey: getSubscriptionByIdQueryKey({
                    path: { id: variables.path.id }
                })
            })
        },
        onError: error => {
            handleError(error, 'Error updating subscription')
        }
    })

    const deleteMutation = useMutation({
        ...deleteSubscriptionMutation(),
        onSuccess: (_, variables) => {
            subscriptionStore.removeSubscription(variables.path.id)
            queryClient.invalidateQueries({ queryKey: getSubscriptionsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting subscription')
        }
    })

    const fetchSubscriptions = async () => {
        try {
            const response = await queryClient.fetchQuery(getSubscriptionsOptions())

            if (!response?.success) return []

            return response?.data as SubscriptionData[]
        } catch (error) {
            return handleError(error, 'Error fetching subscriptions')
        }
    }

    const getSubscription = async (subscriptionId: string) => {
        try {
            const response = await queryClient.fetchQuery(
                getSubscriptionByIdOptions({
                    path: { id: subscriptionId }
                })
            )

            if (!response?.success) return null

            return response?.data as SubscriptionData
        } catch (error) {
            return handleError(error, 'Error fetching subscription')
        }
    }

    const getNextExecutionText = (subscription: Partial<SubscriptionData>) => {
        if (!subscription.firstPayment) return ''

        const firstPayment = new Date(subscription.firstPayment)
        if (Number.isNaN(firstPayment.getTime())) return ''

        const cycleNumber = Math.max(1, Number(subscription.cycleNumber) || 1)
        const cyclePeriod = String(subscription.cyclePeriod || 'MONTH')

        let nextExecution = new Date(firstPayment)
        const now = new Date()

        for (let i = 0; i < 500 && nextExecution < now; i++) {
            nextExecution = addCycle(nextExecution, cycleNumber, cyclePeriod)
        }

        return nextExecution.toLocaleDateString()
    }

    const subscriptionLoading: LoadingState = {
        create: createMutation.isPending,
        update: updateMutation.isPending,
        delete: deleteMutation.isPending,
        fetch: useIsFetching({ queryKey: getSubscriptionsQueryKey() }) > 0,
        get:
            useIsFetching({
                predicate: query => {
                    const key = query.queryKey?.[0] as { _id?: string } | undefined
                    return key?._id === 'getSubscriptionById'
                }
            }) > 0
    }

    return {
        subscriptionCacheList: subscriptionStore.subscriptionCacheList,
        subscriptionLoading,
        createSubscription: createMutation.mutateAsync,
        editSubscription: updateMutation.mutateAsync,
        removeSubscription: deleteMutation.mutateAsync,
        getSubscription,
        fetchSubscriptions,
        getNextExecutionText
    }
}
