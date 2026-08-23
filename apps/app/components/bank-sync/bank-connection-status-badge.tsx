import { cn } from '@poveroh/ui/lib/utils'
import { useTranslations } from 'next-intl'
import { STATUS_COLOR, type BankSyncConnectionStatusEnum } from '@poveroh/types'

type BankConnectionStatusBadgeProps = {
    status: BankSyncConnectionStatusEnum
}

export function BankConnectionStatusBadge({ status }: BankConnectionStatusBadgeProps) {
    const t = useTranslations()
    const [dotColor, textColor] = STATUS_COLOR[status].split(' ')

    return (
        <div className={cn('flex flex-row items-center gap-2')}>
            <span className={cn('h-2 w-2 rounded-full', dotColor)} />
            <p className={cn(textColor)}>{t(`bankSync.status.${status}`)}</p>
        </div>
    )
}
