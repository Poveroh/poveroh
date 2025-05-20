import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import { ISubscription } from '@poveroh/types'

type SubscriptionStore = {
    subscriptionCacheList: ISubscription[]
    addSubscription: (subscription: ISubscription) => void
    editSubscription: (subscription: ISubscription) => void
    setSubscription: (subscription: ISubscription[]) => void
    removeSubscription: (subscription_id: string) => void
    getSubscription: (subscription_id: string) => ISubscription | null
}

export const useSubscriptionsStore = create<SubscriptionStore>((set, get) => ({
    subscriptionCacheList: [],

    addSubscription: subscription => {
        set(state => {
            const list = [...state.subscriptionCacheList, subscription]
            return {
                subscriptionCacheList: list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
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
                    subscriptionCacheList: list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
                }
            }
            return state
        })
    },

    setSubscription: subscriptions => {
        set(() => ({
            subscriptionCacheList: subscriptions.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        }))
    },

    removeSubscription: subscription_id => {
        set(state => ({
            subscriptionCacheList: state.subscriptionCacheList.filter(item => item.id !== subscription_id)
        }))
    },

    getSubscription: subscription_id => {
        const subscriptionCacheList = get().subscriptionCacheList
        return subscriptionCacheList.find(item => item.id === subscription_id) || null
    }
}))
