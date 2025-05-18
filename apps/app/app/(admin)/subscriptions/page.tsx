import { Metadata } from 'next'
import SubscriptionsView from './view'

export const metadata: Metadata = {
    title: 'Subscriptions'
}

export default function SubscriptionsPage() {
    return <SubscriptionsView />
}
