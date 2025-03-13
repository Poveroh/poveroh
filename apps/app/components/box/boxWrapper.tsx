import { ReactElement, ReactNode } from 'react'

type BoxProps = {
    title?: string
    header?: ReactNode
    children: ReactElement
}

export default function Box({ title, header, children }: BoxProps) {
    return (
        <div className='flex flex-col bg-box-background space-y-7 p-6 w-full rounded-md'>
            {title && (
                <div className='flex flex-row items-center justify-between'>
                    <h4 className='font-bold'>{title}</h4>
                    {header}
                </div>
            )}
            <div className='flex flex-col space-y-7'>{children}</div>
        </div>
    )
}
