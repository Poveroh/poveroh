import { ReactElement } from 'react'

type BoxProps = {
    title: string
    description?: string
    sideChildren: ReactElement | ReactElement[]
}

export default function BoxHeader({ title, description, sideChildren }: BoxProps) {
    return (
        <div className='w-full flex items-center justify-between'>
            <div className='flex flex-col gap-1'>
                <h4 className='font-bold'>{title}</h4>
                {description && <p className='sub'>{description}</p>}
            </div>
            <div className='flex flex-col gap-2'>{sideChildren}</div>
        </div>
    )
}
