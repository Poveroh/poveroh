'use client'

import { useUserStore } from '@/store/auth.store'
import { encryptString } from '@poveroh/utils'
import { useError } from './use-error'
import { authClient, getSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { User } from '@poveroh/types/contracts'
import { putUser } from '@/lib/api-client'

export const useUser = () => {
    const { handleError } = useError()
    const userStore = useUserStore()

    const router = useRouter()

    const me = async (): Promise<User | null> => {
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

    const saveUser = async (userToSave: Partial<User>) => {
        try {
            // Call hey-api putUser directly
            const response = await putUser({
                body: userToSave
            })

            if (response.error) {
                throw new Error('Error saving user')
            }

            await userStore.updateUser(userToSave)

            if (userToSave.email && userStore.user.email != userToSave.email) {
                const res = await authClient.changeEmail({
                    newEmail: userToSave.email,
                    callbackURL: '/logout'
                })

                if (res.data?.status as boolean) {
                    router.push('/logout')
                }
            }

            return true
        } catch (error) {
            return handleError(error, 'Error saving user data')
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

            if (data && !error) {
                return true
            }

            return false
        } catch (error) {
            handleError(error, 'Error updating password')
            return false
        }
    }

    return {
        user: userStore.user,
        me,
        saveUser,
        updatePassword
    }
}
