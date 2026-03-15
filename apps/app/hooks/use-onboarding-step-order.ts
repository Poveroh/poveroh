import { useCallback } from 'react'
import { OnBoardingStepEnum } from '@poveroh/types/contracts'

export function useOnBoardingStepOrder() {
    const ONBOARDING_ORDER: readonly OnBoardingStepEnum[] = ['EMAIL', 'GENERALITES', 'PREFERENCES', 'COMPLETED']

    const getIndex = useCallback((step: OnBoardingStepEnum) => {
        if (!step) {
            return -1
        }

        return ONBOARDING_ORDER.indexOf(step)
    }, [])

    const isAtLeast = useCallback(
        (step: OnBoardingStepEnum, threshold: OnBoardingStepEnum) => getIndex(step) >= getIndex(threshold),
        [getIndex]
    )

    return {
        getIndex,
        isAtLeast
    }
}
