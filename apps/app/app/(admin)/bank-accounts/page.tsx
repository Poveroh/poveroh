import { Metadata } from 'next'
import BankAccountView from './view'

export const metadata: Metadata = {
    title: 'Bank Accounts'
}

export default function BankAccountPage() {
    return <BankAccountView />
}
