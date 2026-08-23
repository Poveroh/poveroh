import { Metadata } from 'next'
import BankSyncCallbackView from './view'

export const metadata: Metadata = {
    title: 'Bank sync'
}

export default function BankSyncCallbackPage() {
    return <BankSyncCallbackView />
}
