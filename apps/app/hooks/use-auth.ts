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
import { useUser } from './use-user'

export const useAuth = () => {
    const { handleError } = useError()
    const { me } = useUser()
    const userStore = useUserStore()
    const router = useRouter()

    const authSession = authClient.useSession()

    const signIn = useCallback(async (userToLogin: IUserLogin) => {
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

            await me()

            return true
        } catch (error) {
            return handleError(error, 'Login failed')
        }
    }, [])

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

    const logout = async () => {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        cookie.remove('token')
                        storage.clear()
                        userStore.resetAll()

                        router.push('/sign-in')
                    }
                }
            })
        } catch (error) {
            console.error('Logout error:', error)

            cookie.remove('token')
            storage.clear()
            userStore.resetAll()

            router.push('/sign-in')
        }
    }

    const isAuthenticate = useCallback(() => {
        return !!authSession.data?.session
    }, [authSession])

    return {
        logout,
        signIn,
        signUp,
        isAuthenticate
    }
}
