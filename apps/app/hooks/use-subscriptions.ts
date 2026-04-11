'use client'

import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { useError } from './use-error'
import {
    createSubscriptionMutation,
    deleteSubscriptionMutation,
    deleteSubscriptionsMutation,
    getSubscriptionByIdOptions,
    getSubscriptionByIdQueryKey,
    getSubscriptionsOptions,
    getSubscriptionsQueryKey,
    updateSubscriptionMutation
} from '@/api/@tanstack/react-query.gen'
import { SubscriptionData, SubscriptionFilters } from '@poveroh/types'
import { useFilters } from './use-filters'

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

    const filters = useFilters<SubscriptionFilters>(text => ({
        title: { contains: text },
        description: { contains: text }
    }))

    const [subscriptionQuery] = useQueries({
        queries: [
            {
                ...getSubscriptionsOptions(
                    filters.activeFilters ? { query: { filter: filters.activeFilters } } : undefined
                ),
                staleTime: Infinity
            }
        ]
    })

    const createMutation = useMutation({
        ...createSubscriptionMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getSubscriptionsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error adding subscription')
        }
    })

    const updateMutation = useMutation({
        ...updateSubscriptionMutation(),
        onSuccess: (_, variables) => {
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getSubscriptionsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting subscription')
        }
    })

    const deleteAllMutation = useMutation({
        ...deleteSubscriptionsMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getSubscriptionsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting all subscriptions')
        }
    })

    const getSubscriptionById = async (subscriptionId: string) => {
        try {
            const response = await queryClient.fetchQuery(
                getSubscriptionByIdOptions({
                    path: { id: subscriptionId }
                })
            )

            if (!response?.success) return null

            return (response?.data ?? null) as SubscriptionData | null
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

    return {
        ...filters,
        subscriptionQuery,
        createMutation,
        updateMutation,
        deleteMutation,
        deleteAllMutation,
        getSubscriptionById,
        getNextExecutionText
    }
}
