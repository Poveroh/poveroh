'use client'

import { authClient } from '@/lib/auth'
import { authToken } from '@/lib/auth-token'
import { cookie, storage } from '@/lib/storage'
import { useUserStore } from '@/store/auth.store'
import { isValidEmail, isEmpty } from '@poveroh/utils'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useError } from './use-error'
import { useUser } from './use-user'
import { UserLogin } from '@poveroh/types/contracts'

export const useAuth = () => {
    const { handleError } = useError()
    const { getMe } = useUser()

    const userStore = useUserStore()
    const router = useRouter()

    const authSession = authClient.useSession()

    const storeTokenFromFetchContext = (context: unknown) => {
        const response = (context as { response?: Response } | undefined)?.response
        const token = response?.headers?.get('set-auth-token')
        if (token) {
            authToken.set(token)
        }
    }

    const cleanUpAuthData = () => {
        authToken.clear()
        cookie.clear()
        storage.clear()
        userStore.resetAll()

        router.push('/sign-in')
    }

    const signIn = useCallback(
        async (userToLogin: UserLogin) => {
            try {
                if (!isValidEmail(userToLogin.email)) {
                    throw new Error('E-mail not valid')
                }
                if (isEmpty(userToLogin.password)) {
                    throw new Error('Password not valid')
                }

                const result = await authClient.signIn.email({
                    ...userToLogin,
                    fetchOptions: {
                        onSuccess: storeTokenFromFetchContext
                    }
                })

                if (result.error) {
                    throw new Error(result.error.message || 'Login failed')
                }

                userStore.setLogged(true)

                return await getMe()
            } catch (error) {
                return handleError(error, 'Login failed')
            }
        },
        [handleError, getMe, userStore]
    )

    const signUp = useCallback(
        async (userToSave: UserLogin) => {
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
                    name: ' ',
                    fetchOptions: {
                        onSuccess: storeTokenFromFetchContext
                    }
                })

                if (result.error) {
                    throw new Error(result.error.message || 'Sign up failed')
                }

                userStore.setLogged(true)

                return true
            } catch (error) {
                handleError(error, 'Sign up failed')
                return false
            }
        },
        [handleError, userStore]
    )

    const logout = async () => {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        cleanUpAuthData()
                    },
                    onError: error => {
                        handleError(error, 'Error during sign out')
                    }
                }
            })
        } catch (error) {
            handleError(error, 'Logout failed')
            cleanUpAuthData()
        }
    }

    const isAuthenticated = useCallback(() => {
        return !!authSession.data?.session
    }, [authSession])

    return {
        logout,
        signIn,
        signUp,
        isAuthenticated
    }
}
