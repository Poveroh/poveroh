import { BoxHeaderProps } from '@/types/box'
import BoxHeader from './box-header'
import { ReactElement } from 'react'

type BoxItemProps = {
    header: BoxHeaderProps
    children: ReactElement
}

export default function BoxItem({ header, children }: BoxItemProps) {
    return (
        <div className='flex flex-col gap-4 first:pt-0 last:pb-0'>
            <BoxHeader {...header} />
            {children}
        </div>
    )
}
