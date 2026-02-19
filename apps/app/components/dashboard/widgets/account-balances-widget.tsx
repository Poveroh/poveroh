'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@poveroh/ui/components/card'
import { AccountBalancesMiniChart } from '../charts/account-balances-mini-chart'
import { accountBalances } from '../mock-data'

export const AccountBalancesWidget = () => (
    <Card className='h-full'>
        <CardHeader>
            <CardTitle>Saldi conti</CardTitle>
            <CardDescription>Barre proporzionali e variazioni.</CardDescription>
        </CardHeader>
        <CardContent>
            <AccountBalancesMiniChart data={accountBalances} />
        </CardContent>
    </Card>
)
