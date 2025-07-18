import React from 'react'
import clsx from 'clsx'

type DividerProps = {
    orientation?: 'horizontal' | 'vertical'
    className?: string
}

export function Divider({ orientation = 'horizontal', className = '' }: DividerProps) {
    const baseStyle = 'bg-divider'
    const horizontalStyle = 'w-full h-px my-2'
    const verticalStyle = 'h-full w-px mx-2'

    return (
        <div className={clsx(baseStyle, orientation === 'horizontal' ? horizontalStyle : verticalStyle, className)} />
    )
}
