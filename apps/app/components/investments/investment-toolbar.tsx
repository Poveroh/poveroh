import type { ChangeEvent } from 'react'

import { Button } from '@poveroh/ui/components/button'
import { Input } from '@poveroh/ui/components/input'
import { cn } from '@poveroh/ui/lib/utils'
import { Filter, Search } from 'lucide-react'

export function InvestmentToolbar({
    searchPlaceholder,
    filterLabel,
    onSearch
}: {
    searchPlaceholder: string
    filterLabel: string
    onSearch: (event: ChangeEvent<HTMLInputElement>) => void
}) {
    return (
        <div className='flex flex-col gap-3 md:flex-row'>
            <Input
                startIcon={Search}
                placeholder={searchPlaceholder}
                className='w-full md:w-[420px]'
                onChange={onSearch}
            />
            <Button variant='secondary' className={cn('w-full md:w-auto')}>
                <Filter />
                {filterLabel}
            </Button>
        </div>
    )
}
