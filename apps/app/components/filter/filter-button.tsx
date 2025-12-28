'use client'

import { useEffect, useState } from 'react'
import { Button } from '@poveroh/ui/components/button'
import { Input } from '@poveroh/ui/components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@poveroh/ui/components/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { ListFilter } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FilterField } from '@poveroh/types'
import Divider from '../other/divider'

type FilterButtonProps<T> = {
    fields: FilterField[]
    filters: T
    onFilterChange: (filters: T) => void
}

export function FilterButton<T>({ fields, filters, onFilterChange }: FilterButtonProps<T>) {
    const t = useTranslations()

    const [localFilters, setLocalFilters] = useState<T>(filters)

    useEffect(() => {
        setLocalFilters(filters)
    }, [filters])

    const handleChange = (name: keyof T, value: string) => {
        const updated = { ...localFilters, [name]: value }
        setLocalFilters(updated)
        onFilterChange(updated)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='secondary' className='w-fit'>
                    <ListFilter />
                    {t('filter.title')}
                </Button>
            </PopoverTrigger>
            <PopoverContent align='end'>
                <div className='flex flex-col space-y-3'>
                    {fields.map((field, index) => {
                        if (field.type === 'select') {
                            return (
                                <div key={field.name} className='flex flex-col space-y-3'>
                                    <p>{t(field.label)}</p>
                                    <Select
                                        value={(localFilters[field.name as keyof T] as string) || ''}
                                        onValueChange={val => handleChange(field.name as keyof T, val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('messages.selectValue')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.options.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {index < fields.length - 1 && <Divider />}
                                </div>
                            )
                        }

                        if (field.type === 'dateRange') {
                            return (
                                <div key={field.name} className='flex flex-col space-y-3'>
                                    <div className='flex flex-row gap-2'>
                                        <div className='flex flex-col space-y-3'>
                                            <p>{t('form.date.rangePlaceholder.from')}</p>
                                            <Input
                                                type='date'
                                                value={(localFilters[field.fromName as keyof T] as string) || ''}
                                                onChange={e => handleChange(field.fromName as keyof T, e.target.value)}
                                                placeholder='From'
                                            />
                                        </div>
                                        <div className='flex flex-col space-y-3'>
                                            <p>{t('form.date.rangePlaceholder.to')}</p>
                                            <Input
                                                type='date'
                                                value={(localFilters[field.toName as keyof T] as string) || ''}
                                                onChange={e => handleChange(field.toName as keyof T, e.target.value)}
                                                placeholder='To'
                                            />
                                        </div>
                                    </div>
                                    {index < fields.length - 1 && <Divider />}
                                </div>
                            )
                        }

                        return (
                            <div key={field.name} className='flex flex-col space-y-3'>
                                <p>{t(field.label)}</p>
                                <Input
                                    type={field.type}
                                    value={(localFilters[field.name as keyof T] as string) || ''}
                                    onChange={e => handleChange(field.name as keyof T, e.target.value)}
                                />
                                {index < fields.length - 1 && <Divider />}
                            </div>
                        )
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}
