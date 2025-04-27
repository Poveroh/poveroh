import { storage } from '@/lib/storage'
import { defaultUser, IUser } from '@poveroh/types'
import { create } from 'zustand'

type UserStore = {
    user: IUser
    logged: boolean
    setUser: (newUser: IUser) => void
    setLogged: (newLoggedState: boolean) => void
    resetAll: () => void
}

export const useUserStore = create<UserStore>(set => ({
    user: defaultUser,
    logged: false,
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
