import Image from 'next/image'

export type LogoProps = {
    color: 'black' | 'white'
    mode: 'horizontal' | 'vertical' | 'symbol' | 'written'
    width: number
    height: number
}

export function Logo(props: LogoProps) {
    return (
        <Image
            src={`/logo/${props.color}/${props.mode}.svg`}
            alt='logo'
            width={props.width}
            height={props.height}
        />
    )
}
