import { Metadata } from 'next'
import PreferencesView from './view'

export const metadata: Metadata = {
    title: 'Preferences'
}

export default function PreferencesPage() {
    return <PreferencesView></PreferencesView>
}
