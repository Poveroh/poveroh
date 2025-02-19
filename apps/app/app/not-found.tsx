'use client'

import { Link } from 'lucide-react'
import React from 'react'
import { useEffect, useState } from 'react'

const NotFoundPage = () => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return <div>Loading...</div>
    }

    return (
        <div className='flex min-h-screen flex-col items-center justify-center p-4'>
            <h1 className='text-4xl font-bold mb-4'>404 - Page Not Found</h1>
            <p className='text-lg mb-6'>The page you&apos;re looking for doesn&apos;t exist.</p>
            <Link
                href='/'
                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
            >
                Return Home
            </Link>
        </div>
    )
}

export default NotFoundPage
