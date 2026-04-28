import { Metadata } from 'next'
import InvestmentsView from './view'

export const metadata: Metadata = {
    title: 'Investments'
}

export default function InvestmentsPage() {
    return <InvestmentsView />
}
