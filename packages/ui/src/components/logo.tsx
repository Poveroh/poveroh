export type LogoProps = {
    color: 'black' | 'white'
    mode: 'horizontal' | 'vertical' | 'symbol' | 'written'
    width: number
    height: number
}

export function Logo(props: LogoProps) {
    return <img src={`/logo/${props.color}/${props.mode}.svg`} alt='logo' width={props.width} height={props.height} />
}
