'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@poveroh/ui/components/popover'
import { Ellipsis } from 'lucide-react'
import { Button } from '@poveroh/ui/components/button'
import DynamicIcon from '../icon/dynamic-icon'
import { cn } from '@poveroh/ui/lib/utils'
import { ExtraButton } from '@/types/options'

type OptionsPopoverContentProps<T> = {
    data: T
    buttons?: Array<ExtraButton<T>>
}

function OptionsContent<T>({ data, buttons }: OptionsPopoverContentProps<T>) {
    return (
        <div className='flex flex-col'>
            {buttons?.map(btn => {
                if (btn.hide) return null
                return (
                    <Button
                        key={btn.label}
                        className='justify-start w-full'
                        variant={btn.variant == 'danger' ? 'ghost' : btn.variant || 'ghost'}
                        onClick={e => {
                            e.stopPropagation()
                            btn.onClick(data)
                        }}
                    >
                        {btn.icon && (
                            <DynamicIcon
                                name={btn.icon}
                                className={cn('mr-2', btn.variant == 'danger' ? 'danger' : '')}
                            />
                        )}
                        <p className={btn.variant == 'danger' ? 'text-danger' : ''}>{btn.label}</p>
                    </Button>
                )
            })}
        </div>
    )
}

export function OptionsPopover<T>(props: OptionsPopoverContentProps<T>) {
    return (
        <Popover>
            <PopoverTrigger asChild onClick={e => e.stopPropagation()}>
                <Button size='icon' variant='ghost'>
                    <Ellipsis />
                </Button>
            </PopoverTrigger>
            <PopoverContent align='end' className='w-52'>
                <OptionsContent {...props} />
            </PopoverContent>
        </Popover>
    )
}
