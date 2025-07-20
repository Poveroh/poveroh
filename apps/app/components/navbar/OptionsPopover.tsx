'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@poveroh/ui/components/popover'
import { useTranslations } from 'next-intl'
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import Divider from '@/components/other/Divider'

type OptionsPopoverContentProps<T> = {
    data: T
    openDelete: (item: T) => void
    openEdit: (item: T) => void
}

function OptionsContent<T>({ data, openDelete, openEdit }: OptionsPopoverContentProps<T>) {
    const t = useTranslations()

    return (
        <div className='flex flex-col space-y-5'>
            <a
                className='flex items-center space-x-2 w-full cursor-pointer'
                onClick={e => {
                    e.stopPropagation()
                    openEdit(data)
                }}
            >
                <Pencil size={20} />
                <p>{t('buttons.editItem')}</p>
            </a>
            <Divider />
            <a
                className='flex items-center space-x-2 w-full cursor-pointer'
                onClick={e => {
                    openDelete(data)
                    e.stopPropagation()
                }}
            >
                <Trash2 className='danger' size={20} />
                <p className='danger'>{t('buttons.deleteItem')}</p>
            </a>
        </div>
    )
}

export function OptionsPopover<T>({ data, openDelete, openEdit }: OptionsPopoverContentProps<T>) {
    return (
        <Popover>
            <PopoverTrigger asChild onClick={e => e.stopPropagation()}>
                <EllipsisVertical className='cursor-pointer' />
            </PopoverTrigger>
            <PopoverContent align='end' className='w-52'>
                <OptionsContent data={data} openDelete={openDelete} openEdit={openEdit} />
            </PopoverContent>
        </Popover>
    )
}
