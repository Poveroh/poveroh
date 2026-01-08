import { Metadata } from 'next'
import AccountView from './view'

export const metadata: Metadata = {
    title: 'Accounts'
}

export default function AccountPage() {
    return <AccountView />
}
