import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import { ISubscription } from '@poveroh/types'

type SubscriptionStore = {
    subscriptionCacheList: ISubscription[]
    addSubscription: (subscription: ISubscription) => void
    editSubscription: (subscription: ISubscription) => void
    setSubscriptions: (subscriptions: ISubscription[]) => void
    removeSubscription: (subscriptionId: string) => void
    getSubscription: (subscriptionId: string) => ISubscription | null
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
