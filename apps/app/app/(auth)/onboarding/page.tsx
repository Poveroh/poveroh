import { Metadata } from 'next'
import OnBoardingView from './view'

export const metadata: Metadata = {
    title: 'Onboarding'
}

export default function OnBoardingPage() {
    return <OnBoardingView></OnBoardingView>
}
