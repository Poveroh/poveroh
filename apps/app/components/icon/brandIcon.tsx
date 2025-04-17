import { cn } from '@poveroh/ui/lib/utils'

type BrandIconProps = {
    icon: string
    size?: 'xl' | 'sm'
}

export const BrandIcon = ({ icon, size }: BrandIconProps) => {
    return <div className={cn('brands', size)} style={{ backgroundImage: icon }}></div>
}
