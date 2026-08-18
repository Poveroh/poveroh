import { cn } from '@poveroh/ui/lib/utils'
import { useTranslations } from 'next-intl'

export function ProviderStatusBadge({ configured }: { configured: boolean }) {
    const t = useTranslations()

    return (
        <div className={cn('flex flex-row items-center gap-2')}>
            <span className={cn('h-2 w-2 rounded-full', configured ? 'bg-emerald-500' : 'bg-muted-foreground')} />
            <p className={cn(configured ? 'text-emerald-500' : 'text-muted-foreground')}>
                {configured ? t('providers.status.configured') : t('providers.status.notConfigured')}
            </p>
        </div>
    )
}
