import { Metadata } from 'next'
import LoginView from './view'

export const metadata: Metadata = {
    title: 'Sign-in'
}

export default function LoginPage() {
    return <LoginView></LoginView>
}
