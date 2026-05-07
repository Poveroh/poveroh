import { BrandIcon } from '../icon/brand-icon'
import DynamicIcon from '../icon/dynamic-icon'

type CardProp = {
    icon?: string
    logo?: string
    title: string
    subtitle?: string
    onClick?: () => void
}

export function Card(props: CardProp) {
    return (
        <div
            className='flex flex-col space-y-10 h-full p-10 bg-box border border-hr rounded-lg w-full cursor-pointer transition-colors hover:border-primary'
            onClick={props.onClick}
        >
            {props.icon && <DynamicIcon name={props.icon} />}
            {props.logo && <BrandIcon icon={props.logo}></BrandIcon>}
            <div className='flex flex-col space-y-1'>
                <p className='font-bold'>{props.title}</p>
                {props.subtitle && <p className='sub'>{props.subtitle}</p>}
            </div>
        </div>
    )
}
