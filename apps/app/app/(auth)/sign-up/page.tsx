import { Metadata } from 'next'
import SignupView from './view'

export const metadata: Metadata = {
    title: 'Sign-up'
}

export default function SignupPage() {
    return <SignupView></SignupView>
}
