'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@poveroh/ui/components/card'
import { MonthComparisonChart } from '../charts/month-comparison-chart'

export const MonthComparisonWidget = () => (
    <Card className='h-full'>
        <CardHeader>
            <CardTitle>Confronto mese vs mese precedente</CardTitle>
            <CardDescription>Entrate e top uscite a confronto.</CardDescription>
        </CardHeader>
        <CardContent>
            <MonthComparisonChart />
        </CardContent>
    </Card>
)
