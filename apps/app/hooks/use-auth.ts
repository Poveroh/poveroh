'use client'

import { authClient } from '@/lib/auth'
import { cookie, storage } from '@/lib/storage'
import { useUserStore } from '@/store/auth.store'
import { IUserLogin, IUserToSave } from '@poveroh/types'
import { isValidEmail } from '@poveroh/utils'
import { isEmpty } from 'lodash'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useError } from './use-error'

export const useAuth = () => {
    const { handleError } = useError()
    const userStore = useUserStore()
    const router = useRouter()

    const { data: session, isPending } = authClient.useSession()

    // // Sync session with user store
    // useEffect(() => {
    //     if (session?.user) {
    //         const user = {
    //             id: session.user.id,
    //             name: session.user.name || '',
    //             surname: (session.user as any).surname || '',
    //             email: session.user.email,
    //             createdAt: session.user.createdAt || new Date().toISOString()
    //         }
    //         userStore.setUser(user)
    //         userStore.setLogged(true)
    //     } else if (!isPending) {
    //         // Only reset if not loading
    //         userStore.resetAll()
    //     }
    // }, [session, isPending, userStore])

    const signIn = useCallback(
        async (userToLogin: IUserLogin) => {
            try {
                if (!isValidEmail(userToLogin.email)) {
                    throw new Error('E-mail not valid')
                }
                if (isEmpty(userToLogin.password)) {
                    throw new Error('Password not valid')
                }

                const result = await authClient.signIn.email(userToLogin)

                if (result.error) {
                    throw new Error(result.error.message || 'Login failed')
                }

                return true
            } catch (error) {
                return handleError(error, 'Login failed')
            }
        },
        [handleError]
    )

    const signUp = useCallback(
        async (userToSave: IUserToSave) => {
            try {
                if (!isValidEmail(userToSave.email)) {
                    throw new Error('E-mail not valid')
                }
                if (!userToSave.password || isEmpty(userToSave.password)) {
                    throw new Error('Password not valid')
                }

                const result = await authClient.signUp.email({
                    email: userToSave.email,
                    password: userToSave.password,
                    name: userToSave.name + ' ' + userToSave.surname
                })

                if (result.error) {
                    throw new Error(result.error.message || 'Sign up failed')
                }

                return true
            } catch (error) {
                handleError(error, 'Sign up failed')
                return false
            }
        },
        [handleError]
    )

    const logout = useCallback(
        async (redirectToLogin?: boolean) => {
            try {
                await authClient.signOut()

                cookie.remove('token')
                storage.clear()
                userStore.resetAll()

                if (redirectToLogin) {
                    router.push('/sign-in')
                }
            } catch (error) {
                console.error('Logout error:', error)

                cookie.remove('token')
                storage.clear()
                userStore.resetAll()
                if (redirectToLogin) {
                    router.push('/sign-in')
                }
            }
        },
        [userStore, router]
    )

    const isAuthenticate = useCallback(() => {
        return !!session?.user && !isPending
    }, [session, isPending])

    return {
        logged: !!session?.user,
        loading: isPending,
        logout,
        signIn,
        signUp,
        isAuthenticate,
        session
    }
}
