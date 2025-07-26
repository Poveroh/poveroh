import { cn } from '@poveroh/ui/lib/utils'

type BrandIconProps = {
    icon: string
    circled?: boolean
    size?: 'xl' | 'sm'
}

export const BrandIcon = ({ icon, size, circled }: BrandIconProps) => {
    return <div className={cn('brands', size, { circled: circled })} style={{ backgroundImage: `url(${icon})` }}></div>
}
