/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OnBoardingStepEnum } from './OnBoardingStepEnum'
import type { UserPreferences } from './UserPreferences'
export type User = {
    id: string
    name: string
    surname: string
    email: string
    emailVerified: boolean
    onBoardingStep: OnBoardingStepEnum
    onBoardingAt: string | null
    image: string | null
    createdAt: string
    updatedAt: string
    preferences: UserPreferences
}
