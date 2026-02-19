'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@poveroh/ui/components/card'
import { Switch } from '@poveroh/ui/components/switch'
import { Label } from '@poveroh/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { CategoryTrendChart } from '../charts/category-trend-chart'
import { categoryTrendData } from '../mock-data'

export const CategoryTrendWidget = () => {
    const categories = Object.keys(categoryTrendData)
    const [category, setCategory] = useState(categories[0])
    const [mode, setMode] = useState<'absolute' | 'share'>('absolute')

    const data = useMemo(() => categoryTrendData[category as keyof typeof categoryTrendData] || [], [category])

    useEffect(() => {
        const handler = (event: Event) => {
            const detail = (event as CustomEvent<{ category?: string }>).detail
            if (!detail?.category) return
            if (categories.includes(detail.category)) {
                setCategory(detail.category)
            }
        }

        window.addEventListener('dashboard:category-select', handler as EventListener)
        return () => window.removeEventListener('dashboard:category-select', handler as EventListener)
    }, [categories])

    return (
        <Card id='category-trend' className='h-full'>
            <CardHeader>
                <CardTitle>Trend per categoria</CardTitle>
                <CardDescription>Ultimi 6 mesi con switch valore / %.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='flex flex-wrap items-center gap-4 pb-4'>
                    <div className='w-[220px]'>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder='Seleziona categoria' />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(item => (
                                    <SelectItem key={item} value={item}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Switch
                            checked={mode === 'share'}
                            onCheckedChange={checked => setMode(checked ? 'share' : 'absolute')}
                        />
                        <Label>{mode === 'share' ? '% sul totale' : 'Valore assoluto'}</Label>
                    </div>
                </div>
                <CategoryTrendChart data={data} mode={mode} />
            </CardContent>
        </Card>
    )
}
