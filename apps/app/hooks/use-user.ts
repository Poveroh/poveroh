'use client'

import { UserService } from '@/services/user.service'
import { useUserStore } from '@/store/auth.store'
import { IUser } from '@poveroh/types'
import { encryptString } from '@poveroh/utils'
import { useError } from './use-error'
import { authClient } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export const useUser = () => {
    const { handleError } = useError()
    const userService = new UserService()
    const userStore = useUserStore()

    const router = useRouter()

    const me = async () => {
        try {
            const result = await authClient.getSession()

            if (result.error) {
                throw new Error(result.error.message || 'Login failed')
            }

            if (result.data) {
                userStore.setUser(result.data.user as IUser)
                userStore.setLogged(true)
            } else {
                userStore.setLogged(false)
            }

            return userStore.user
        } catch (error) {
            userStore.setLogged(false)
            return handleError(error, 'Error fetching user')
        }
    }

    const saveUser = async (userToSave: Partial<IUser>) => {
        try {
            const formData = new FormData()
            formData.append('data', JSON.stringify(userToSave))

            await userService.save(userStore.user.id, formData)
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
