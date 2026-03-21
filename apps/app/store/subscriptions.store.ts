import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import { SubscriptionData } from '@poveroh/types'

type SubscriptionStore = {
    subscriptionCacheList: SubscriptionData[]
    addSubscription: (subscription: SubscriptionData) => void
    editSubscription: (subscription: SubscriptionData) => void
    setSubscriptions: (subscriptions: SubscriptionData[]) => void
    removeSubscription: (subscriptionId: string) => void
    getSubscription: (subscriptionId: string) => SubscriptionData | null
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
