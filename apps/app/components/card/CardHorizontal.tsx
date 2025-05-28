import { ReactElement } from 'react'
import { BrandIcon } from '../icon/BrandIcon'
import { IBrand } from '@poveroh/types'

type CardProp = {
    onClick: () => void
    icon?: ReactElement
    logo?: string
    title: string
    color: string
}

export function CardHorizontal(props: CardProp) {
    return (
        <div
            onClick={props.onClick}
            className='flex flex-row space-x-5 items-center p-5 border border-hr rounded-lg w-full cursor-pointer'
            style={{
                background: `linear-gradient(90deg, var(--box-color) 0%, ${props.color} 100%)`
            }}
        >
            {props.icon}
            {props.logo && <BrandIcon circled icon={props.logo} />}
            <p className='font-bold'>{props.title}</p>
        </div>
    )
}
