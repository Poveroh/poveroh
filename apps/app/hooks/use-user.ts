'use client'

import { useUserStore } from '@/store/auth.store'
import { encryptString } from '@poveroh/utils'
import { useError } from './use-error'
import { authClient, getSession } from '@/lib/auth'
import { User } from '@poveroh/types/contracts'
import { updateAuthenticatedUserMutation } from '@/api/@tanstack/react-query.gen'
import { useMutation } from '@tanstack/react-query'
import router from 'next/router'

export const useUser = () => {
    const { handleError } = useError()
    const userStore = useUserStore()

    const updateUser = useMutation({
        ...updateAuthenticatedUserMutation(),
        onSuccess: async (_data, variables) => {
            if (!variables.body) return

            await userStore.updateUser(variables.body)

            if (variables.body.email && userStore.user.email !== variables.body.email) {
                const res = await authClient.changeEmail({
                    newEmail: variables.body.email,
                    callbackURL: '/logout'
                })

                if (res.data?.status) {
                    router.push('/logout')
                }
            }
        },
        onError: error => {
            handleError(error, 'Error saving user data')
        }
    })

    const getMe = async (): Promise<User | null> => {
        try {
            const result = await getSession()

            if (result.error) {
                throw new Error(result.error.message || 'Login failed')
            }

            if (result.data?.user) {
                const user: User = result.data.user
                userStore.setUser(user)
                userStore.setLogged(true)
                return user
            } else {
                userStore.setLogged(false)
                return null
            }
        } catch (error) {
            userStore.setLogged(false)
            handleError(error, 'Error fetching user')
            return null
        }
    }

    const updatePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
        try {
            oldPassword = await encryptString(oldPassword)
            newPassword = await encryptString(newPassword)

            const { data, error } = await authClient.changePassword({
                newPassword: newPassword,
                currentPassword: oldPassword,
                revokeOtherSessions: true
            })

            if (data && error) {
                return false
            }

            return true
        } catch (error) {
            handleError(error, 'Error updating password')
            return false
        }
    }

    return {
        user: userStore.user,
        getMe,
        updateUser,
        updatePassword
    }
}
