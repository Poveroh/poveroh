import { Metadata } from 'next'
import SecurityView from './view'

export const metadata: Metadata = {
    title: 'Security'
}

export default function SecurityPage() {
    return <SecurityView />
}
