import { DEFAULT_USER, DEFAULT_USER_PREFERENCES, OnBoardingStepEnum, User, UserPreferences } from '@poveroh/types'
import { storage } from '@/lib/storage'
import { create } from 'zustand'

type UserStore = {
    user: User
    logged: boolean
    setOnBoardingStep: (newStep: OnBoardingStepEnum) => void
    updateUser: (newUserData: Partial<User>) => void
    updatePreferences: (newPreferences: Partial<UserPreferences>) => void
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
    updatePreferences: (newPreferences: Partial<UserPreferences>) => {
        set(state => ({
            user: {
                ...state.user,
                preferences: { ...(state.user.preferences ?? DEFAULT_USER_PREFERENCES), ...newPreferences }
            }
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
