'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@poveroh/ui/components/card'
import { Button } from '@poveroh/ui/components/button'
import { IncomeCategoriesBarChart } from '../charts/income-categories-bar-chart'
import { ExpenseCategoriesBarChart } from '../charts/expense-categories-bar-chart'
import { expenseCategoriesData } from '../mock-data'

export const IncomeExpenseMonthWidget = () => (
    <Card className='h-full'>
        <CardHeader>
            <CardTitle>Entrate e uscite mese corrente</CardTitle>
            <CardDescription>Top categorie principali.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className='grid gap-6 lg:grid-cols-2'>
                <div>
                    <p className='mb-2 text-sm font-medium text-muted-foreground'>Entrate</p>
                    <IncomeCategoriesBarChart />
                </div>
                <div>
                    <p className='mb-2 text-sm font-medium text-muted-foreground'>Uscite</p>
                    <ExpenseCategoriesBarChart />
                    <div className='mt-3 flex flex-wrap gap-2'>
                        {expenseCategoriesData.slice(0, 6).map(item => (
                            <Button
                                key={item.category}
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={() => {
                                    window.dispatchEvent(
                                        new CustomEvent('dashboard:category-select', {
                                            detail: { category: item.category }
                                        })
                                    )
                                    document.getElementById('category-trend')?.scrollIntoView({ behavior: 'smooth' })
                                }}
                            >
                                {item.category}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
)
