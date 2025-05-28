import { ReactElement } from 'react'
import { BrandIcon } from '../icon/BrandIcon'

type CardProp = {
    icon?: ReactElement
    logo?: string
    title: string
    subtitle?: string
}

export function Card(props: CardProp) {
    return (
        <div className='flex flex-col space-y-10 h-full p-10 bg-box border border-hr rounded-lg w-full'>
            {props.icon}
            {props.logo && <BrandIcon icon={props.logo}></BrandIcon>}
            <div className='flex flex-col space-y-1'>
                <p className='font-bold'>{props.title}</p>
                {props.subtitle && <p>{props.subtitle}</p>}
            </div>
        </div>
    )
}
