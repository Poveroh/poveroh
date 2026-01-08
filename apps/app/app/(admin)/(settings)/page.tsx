import router from 'next/router'
import { useEffect } from 'react'

export default function SettingsPage() {
    useEffect(() => {
        router.push('/settings/profile')
    }, [])

    return <></>
}
