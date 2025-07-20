'use client'

import { UserService } from '@/services/user.service'
import { useUserStore } from '@/store/auth.store'
import { IUser, IUserToSave } from '@poveroh/types'
import { encryptString } from '@poveroh/utils'
import { isEqual } from 'lodash'
import { useRouter } from 'next/navigation'
import { useError } from './useError'

export const useUser = () => {
    const { handleError } = useError()

    const userService = new UserService()
    const userStore = useUserStore()
    const router = useRouter()

    const me = async (readFromServer?: boolean) => {
        try {
            let user: IUser | null

            if (readFromServer) {
                user = await userService.read()

                if (!user) {
                    throw new Error('User not found')
                }

                userStore.setUser(user)
            } else {
                user = userStore.user
            }

            if (!user) {
                throw new Error('User not found')
            }

            return user
        } catch (error) {
            return handleError(error, 'Error fetching user')
        }
    }

    const saveUser = async (userToSave: IUserToSave) => {
        try {
            const formData = new FormData()
            formData.append('data', JSON.stringify(userToSave))

            const res = await userService.save(userStore.user.id, formData)

            if (res) {
                const currEmail = userStore.user.email
                userStore.setUser({ ...userStore.user, ...userToSave })

                if (!isEqual(currEmail, userToSave.email)) {
                    router.push('/logout')
                }
            }

            return res
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
