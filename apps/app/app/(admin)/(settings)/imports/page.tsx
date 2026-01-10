import { Metadata } from 'next'
import ImportsView from './view'

export const metadata: Metadata = {
    title: 'Imports'
}

export default function ImportsPage() {
    return <ImportsView />
}
