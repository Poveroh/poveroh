'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@poveroh/ui/components/card'
import { LiquidityEvolutionChart } from '../charts/liquidity-evolution-chart'

export const LiquidityEvolutionWidget = () => (
    <Card className='h-full'>
        <CardHeader>
            <CardTitle>Liquidità ultimi 12 mesi</CardTitle>
            <CardDescription>Saldo totale fine mese e media mobile entrate.</CardDescription>
        </CardHeader>
        <CardContent>
            <LiquidityEvolutionChart />
        </CardContent>
    </Card>
)
