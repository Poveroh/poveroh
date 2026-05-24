import { SummaryRowProps } from '@/types/investment'
import { cn } from '@poveroh/ui/lib/utils'

export function SummaryRow({ label, value, strong = false }: SummaryRowProps) {
    return (
        <div className='flex items-center justify-between'>
            <p className={cn(strong && 'font-semibold', !strong && 'text-muted-foreground')}>{label}</p>
            <p className={cn(strong && 'font-semibold')}>{value}</p>
        </div>
    )
}
