'use client'

import { cookie, storage } from '@/lib/storage'
import { AuthService } from '@/services/auth.service'
import { useUserStore } from '@/store/auth.store'
import { IUserLogin, IUserToSave } from '@poveroh/types'
import { encryptString, isValidEmail } from '@poveroh/utils'
import { isEmpty } from 'lodash'
import { redirect } from 'next/navigation'
import { useError } from './use-error'

export const useAuth = () => {
    const { handleError } = useError()

    const authService = new AuthService()
    const userStore = useUserStore()

    const signIn = async (userToLogin: IUserLogin) => {
        try {
            if (!isValidEmail(userToLogin.email)) {
                throw new Error('E-mail not valid')
            }
            if (isEmpty(userToLogin.password)) {
                throw new Error('Password not valid')
            }

            userToLogin.password = await encryptString(userToLogin.password)

            const res = await authService.signIn(userToLogin)

            if (res) {
                userStore.setUser(res)
                return true
            }

            return false
        } catch (error) {
            return handleError(error, 'Login failed')
        }
    }

    const signUp = async (userToSave: IUserToSave) => {
        try {
            if (!isValidEmail(userToSave.email)) {
                throw new Error('E-mail not valid')
            }
            if (!userToSave.password || isEmpty(userToSave.password)) {
                throw new Error('Password not valid')
            }

            userToSave.password = await encryptString(userToSave.password)

            const resUser = await authService.signUp(userToSave)

            if (resUser) {
                userStore.setUser(resUser)
                return true
            }

            return false
        } catch (error) {
            handleError(error, 'Sign up failed')
            return false
        }
    }

    const logout = (redirectToLogin?: boolean) => {
        storage.clear()
        cookie.remove('token')
        userStore.resetAll()

        if (redirectToLogin) {
            redirect('/sign-in')
        }
    }

    const isAuthenticate = () => {
        return cookie.has('token')
    }

    return {
        logged: userStore.logged,
        logout,
        signIn,
        signUp,
        isAuthenticate
    }
}
