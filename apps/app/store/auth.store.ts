import { storage } from '@/lib/storage'
import { DEFAULT_USER } from '@poveroh/types'
import { OnBoardingStepEnum, User } from '@poveroh/types/contracts'
import { create } from 'zustand'

type UserStore = {
    user: User
    logged: boolean
    setOnBoardingStep: (newStep: OnBoardingStepEnum) => void
    updateUser: (newUserData: Partial<User>) => void
    setUser: (newUser: User) => void
    setLogged: (newLoggedState: boolean) => void
    resetAll: () => void
}

export const useUserStore = create<UserStore>(set => ({
    user: DEFAULT_USER,
    setOnBoardingStep: (newStep: OnBoardingStepEnum) => {
        set(state => ({
            user: { ...state.user, onBoardingStep: newStep }
        }))
    },
    logged: false,
    updateUser: (newUserData: Partial<User>) => {
        set(state => ({
            user: { ...state.user, ...newUserData }
        }))
    },
    setUser: (newUser: User) => {
        storage.set('user', newUser)
        set(() => ({ user: newUser }))
    },
    setLogged: (newLoggedState: boolean) => {
        set(() => ({ logged: newLoggedState }))
    },
    resetAll: () => {
        set(() => ({ user: DEFAULT_USER, logged: false }))
    }
}))
