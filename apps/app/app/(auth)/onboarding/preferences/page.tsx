import { Metadata } from 'next'
import OnBoardingPreferencesView from './view'

export const metadata: Metadata = {
    title: 'Preferences'
}

export default function OnBoardingPreferencesPage() {
    return <OnBoardingPreferencesView></OnBoardingPreferencesView>
}
