import { cn } from '@poveroh/ui/lib/utils'
import { ReactElement, ReactNode } from 'react'

type BoxProps = {
    title?: string
    header?: ReactNode
    children: ReactElement | ReactElement[]
    noDivide?: boolean
    gap?: number
}

export default function Box({ title, header, children, noDivide = false, gap = 1 }: BoxProps) {
    return (
        <div className='flex flex-col bg-box-background space-y-7 p-6 w-full rounded-lg'>
            {title && (
                <div className='flex flex-row items-center justify-between'>
                    <h4 className='font-bold'>{title}</h4>
                    {header}
                </div>
            )}
            <div className={cn('flex flex-col', !noDivide && 'divide-y', `gap-${gap}`)}>{children}</div>
        </div>
    )
}
