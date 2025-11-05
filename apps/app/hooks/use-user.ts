'use client'

import { UserService } from '@/services/user.service'
import { useUserStore } from '@/store/auth.store'
import { IUserToSave } from '@poveroh/types'
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
                userStore.setUser(result.data.user)
            }

            return userStore.user
        } catch (error) {
            return handleError(error, 'Error fetching user')
        }
    }

    const saveUser = async (userToSave: IUserToSave) => {
        try {
            const resUpdate = await authClient.updateUser({
                name: userToSave.name + ' ' + userToSave.surname
            })

            if (resUpdate.error) {
                throw new Error(resUpdate.error.message || 'User update failed')
            }

            await userStore.updateUser(userToSave)

            if (userStore.user.email != userToSave.email) {
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

            return await userService.updatePassword(userStore.user.id, { oldPassword, newPassword })
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
