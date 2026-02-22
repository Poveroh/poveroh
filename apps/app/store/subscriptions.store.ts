import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import type { Subscription } from '@/lib/api-client'

type SubscriptionStore = {
    subscriptionCacheList: Subscription[]
    addSubscription: (subscription: Subscription) => void
    editSubscription: (subscription: Subscription) => void
    setSubscriptions: (subscriptions: Subscription[]) => void
    removeSubscription: (subscriptionId: string) => void
    getSubscription: (subscriptionId: string) => Subscription | null
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
    subscriptionCacheList: [],

    addSubscription: subscription => {
        set(state => {
            const list = [...state.subscriptionCacheList, subscription]
            return {
                subscriptionCacheList: list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
            }
        })
    },

    editSubscription: subscription => {
        set(state => {
            const index = state.subscriptionCacheList.findIndex(item => item.id === subscription.id)
            if (index !== -1) {
                const list = cloneDeep(state.subscriptionCacheList)
                list[index] = subscription
                return {
                    subscriptionCacheList: list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                }
            }
            return state
        })
    },

    setSubscriptions: subscriptions => {
        set(() => ({
            subscriptionCacheList: subscriptions.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        }))
    },

    removeSubscription: subscriptionId => {
        set(state => ({
            subscriptionCacheList: state.subscriptionCacheList.filter(item => item.id !== subscriptionId)
        }))
    },

    getSubscription: subscriptionId => {
        const subscriptionCacheList = get().subscriptionCacheList
        return subscriptionCacheList.find(item => item.id === subscriptionId) || null
    }
}))
