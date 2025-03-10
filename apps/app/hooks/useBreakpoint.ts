'use client'

import { useState, useEffect } from 'react'

const breakpoints = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
}

const getBreakpoint = (width: number) => {
    if (width >= breakpoints['2xl']) return '2xl'
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    if (width >= breakpoints.sm) return 'sm'
    return 'xs'
}

export const useBreakpoint = () => {
    const [size, setSize] = useState(() => getBreakpoint(window.innerWidth))
    const [width, setWidth] = useState(window.innerWidth)

    useEffect(() => {
        const handleResize = () => {
            const newWidth = window.innerWidth
            setWidth(newWidth)
            setSize(getBreakpoint(newWidth))
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return { size, width, breakpoints }
}
