'use client'

import { useUserStore } from '@/store/auth.store'
import { OnBoardingStep } from '@poveroh/types'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'

type RouteGuardProps = {
    children: React.ReactNode
    requiredStep?: OnBoardingStep[]
    redirectTo?: string
    inverse?: boolean
}

export function RouteGuard({ children, requiredStep, redirectTo = '/sign-in', inverse = false }: RouteGuardProps) {
    const userStore = useUserStore()
    const router = useRouter()

    const { currentStep, logged } = useMemo(
        () => ({
            currentStep: userStore.user.onBoardingStep,
            logged: userStore.logged
        }),
        [userStore.user.onBoardingStep, userStore.logged]
    )

    const shouldRedirect = useMemo(() => {
        if (requiredStep === undefined) return false

        if (inverse) {
            // For auth pages: if logged and step >= any of the required steps, redirect
            return logged && requiredStep.some(step => currentStep >= step)
        } else {
            // For protected pages: if not logged or step is not in the allowed range, redirect
            return !logged || !requiredStep.includes(currentStep)
        }
    }, [logged, currentStep, requiredStep, inverse])

    useEffect(() => {
        if (shouldRedirect) {
            router.push(redirectTo)
        }
    }, [shouldRedirect, redirectTo, router])

    const shouldRender = useMemo(() => {
        if (requiredStep === undefined) return true

        if (inverse) {
            return !(logged && requiredStep.some(step => currentStep >= step))
        } else {
            return logged && requiredStep.includes(currentStep)
        }
    }, [logged, currentStep, requiredStep, inverse])

    return shouldRender ? <>{children}</> : null
}
