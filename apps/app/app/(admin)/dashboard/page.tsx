import { Metadata } from 'next'
import DashBoardView from './view'

export const metadata: Metadata = {
    title: 'Dashboard'
}

export default function DashboardPage() {
    return <DashBoardView />
}
