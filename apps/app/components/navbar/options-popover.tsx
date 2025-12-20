'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@poveroh/ui/components/popover'
import { useTranslations } from 'next-intl'
import { Ellipsis, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@poveroh/ui/components/button'

type OptionsPopoverContentProps<T> = {
    data: T
    openDelete: (item: T) => void
    openEdit: (item: T) => void
    options?: {
        hideEdit?: boolean
        hideDelete?: boolean
    }
}

function OptionsContent<T>({ data, openDelete, openEdit, options }: OptionsPopoverContentProps<T>) {
    const t = useTranslations()

    return (
        <div className='flex flex-col'>
            {!options?.hideEdit && (
                <Button
                    variant='ghost'
                    className='justify-start w-full'
                    onClick={e => {
                        e.stopPropagation()
                        openEdit(data)
                    }}
                >
                    <Pencil className='mr-2' />
                    <p>{t('buttons.editItem')}</p>
                </Button>
            )}
            {!options?.hideDelete && (
                <Button
                    variant='ghost'
                    className='justify-start w-full'
                    onClick={e => {
                        e.stopPropagation()
                        openDelete(data)
                    }}
                >
                    <Trash2 className='mr-2 danger' />
                    <p className='danger'>{t('buttons.deleteItem')}</p>
                </Button>
            )}
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
