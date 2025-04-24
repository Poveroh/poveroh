import { cookie, storage } from '@/lib/storage'
import { defaultUser, IUser } from '@poveroh/types'
import { isEqual, isEmpty } from 'lodash'
import { redirect } from 'next/navigation'
import { create } from 'zustand'

type AuthStore = {
    user: IUser
    logged: boolean
    setUser: (newUser: IUser) => void
    setLogged: (newLoggedState: boolean) => void
    logout: (redirectToLogin?: boolean) => void
    isAuthenticate: () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: defaultUser,
    logged: false,
    setUser: (newUser: IUser) => {
        storage.set('user', newUser)
        set(() => ({ user: newUser }))
    },
    setLogged: (newLoggedState: boolean) => {
        set(() => ({ logged: newLoggedState }))
    },
    logout: (redirectToLogin?: boolean) => {
        storage.clear()
        cookie.remove('token')
        set(() => ({ user: defaultUser, logged: false }))

        if (redirectToLogin) redirect('/sign-in')
    },
    isAuthenticate: () => {
        const user = get().user
        const storageUser = storage.parse<IUser>('user')
        const token = cookie.has('token')

        return Boolean(token && storageUser && isEqual(user, storageUser) && !isEmpty(user.id))
    }
}))
