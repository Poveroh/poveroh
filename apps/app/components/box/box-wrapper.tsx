import { cn } from '@poveroh/ui/lib/utils'
import { Children, Fragment } from 'react'
import type { ReactNode } from 'react'
import Divider from '@/components/other/divider'

type BoxProps = {
    title?: string
    subtitle?: string
    header?: ReactNode
    children: ReactNode | ReactNode[]
    noDivide?: boolean
    gap?: number
}

export default function Box({ title, subtitle, header, children, noDivide = false, gap = 1 }: BoxProps) {
    const items = Children.toArray(children)

    return (
        <div className='flex flex-col bg-box-background space-y-7 p-6 w-full rounded-lg'>
            {(title || subtitle) && (
                <div className='flex flex-row items-center justify-between'>
                    <div className='flex flex-col gap-1'>
                        {title && <h4 className='font-bold'>{title}</h4>}
                        {subtitle && <p className='sub'>{subtitle}</p>}
                    </div>
                    {header}
                </div>
            )}
            <div className={cn('flex flex-col', `gap-${gap}`)}>
                {noDivide
                    ? children
                    : items.map((child, index) => (
                          <Fragment key={index}>
                              {index > 0 && <Divider className='my-0' />}
                              {child}
                          </Fragment>
                      ))}
            </div>
        </div>
    )
}
