'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@poveroh/ui/components/card'
import { ExpenseMacroDonutChart } from '../charts/expense-macro-donut-chart'

export const ExpenseMacroDistributionWidget = () => (
    <Card className='h-full'>
        <CardHeader>
            <CardTitle>Distribuzione uscite per macro-categoria</CardTitle>
            <CardDescription>Solo macro con peso &gt; 5%.</CardDescription>
        </CardHeader>
        <CardContent>
            <ExpenseMacroDonutChart />
        </CardContent>
    </Card>
)
