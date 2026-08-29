import { Metadata } from 'next'
import BankSyncView from './view'

export const metadata: Metadata = {
    title: 'Bank sync'
}

export default function BankSyncPage() {
    return <BankSyncView />
}
