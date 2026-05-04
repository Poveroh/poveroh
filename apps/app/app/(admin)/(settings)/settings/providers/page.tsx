import { Metadata } from 'next'
import ProvidersView from './view'

export const metadata: Metadata = {
    title: 'Stock provider'
}

export default function ProvidersPage() {
    return <ProvidersView />
}
