import appConfig from '@/config'
import { cn } from '@poveroh/ui/lib/utils'

type CompanyInfoBarProps = {
    small?: boolean
}

export const CompanyInfoBar = ({ small }: CompanyInfoBarProps) => {
    const year = new Date().getFullYear()

    return (
        <div className='flex space-x-2'>
            <p className={cn('sub', { small: small })}>
                {appConfig.name} &#64; {year}
            </p>
            <p className={cn('sub', { small: small })}>&bull;</p>
            <p className={cn('sub', { small: small })}>v{appConfig.version}</p>
        </div>
    )
}
