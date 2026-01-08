import { Metadata } from 'next'
import ProfileView from './view'

export const metadata: Metadata = {
    title: 'Profile'
}

export default function ProfilePage() {
    return <ProfileView></ProfileView>
}
