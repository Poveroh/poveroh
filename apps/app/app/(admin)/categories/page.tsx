import { Metadata } from 'next'
import CategoryView from './view'

export const metadata: Metadata = {
    title: 'Category'
}

export default function CategoyPage() {
    return <CategoryView />
}
