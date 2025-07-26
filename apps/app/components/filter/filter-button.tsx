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

type FilterButtonProps<T extends Record<string, any>> = {
    fields: FilterField[]
    filters: T
    onFilterChange: (filters: T) => void
}

export function FilterButton<T extends Record<string, any>>({ fields, filters, onFilterChange }: FilterButtonProps<T>) {
    const t = useTranslations()

    const [localFilters, setLocalFilters] = useState<T>(filters)

    useEffect(() => {
        setLocalFilters(filters)
    }, [filters])

    const handleChange = (name: keyof T, value: any) => {
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
            <PopoverContent align='end' className='w-72'>
                <div className='flex flex-col space-y-3'>
                    {fields.map((field, index) => (
                        <div key={field.name} className='flex flex-col space-y-3'>
                            <label className='text-sm font-medium'>{t(field.label)}</label>

                            {field.type === 'select' ? (
                                <Select
                                    value={localFilters[field.name] || ''}
                                    onValueChange={val => handleChange(field.name as keyof T, val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Seleziona...' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {field.options.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    type={field.type}
                                    value={localFilters[field.name] || ''}
                                    onChange={e => handleChange(field.name as keyof T, e.target.value)}
                                />
                            )}

                            {fields.length - 1 !== index && <Divider />}
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
