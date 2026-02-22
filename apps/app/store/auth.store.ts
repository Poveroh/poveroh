import { storage } from '@/lib/storage'
import { defaultUser, OnBoardingStep } from '@poveroh/types'
import type { User } from '@/lib/api-client'
import { create } from 'zustand'

type UserStore = {
    user: User
    logged: boolean
    setOnBoardingStep: (newStep: OnBoardingStep) => void
    updateUser: (newUserData: Partial<User>) => void
    setUser: (newUser: User) => void
    setLogged: (newLoggedState: boolean) => void
    resetAll: () => void
}

export const useUserStore = create<UserStore>(set => ({
    user: defaultUser,
    setOnBoardingStep: (newStep: OnBoardingStep) => {
        set(state => ({
            user: { ...state.user, onBoardingStep: newStep }
        }))
    },
    logged: false,
    updateUser: (newUserData: Partial<IUser>) => {
        set(state => ({
            user: { ...state.user, ...newUserData }
        }))
    },
    setUser: (newUser: IUser) => {
        storage.set('user', newUser)
        set(() => ({ user: newUser }))
    },
    setLogged: (newLoggedState: boolean) => {
        set(() => ({ logged: newLoggedState }))
    },
    resetAll: () => {
        set(() => ({ user: defaultUser, logged: false }))
    }
}))
