'use client'

import { PropsWithChildren, useMemo } from 'react'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { DashboardLayoutItem, DashboardWidgetId } from '@poveroh/types'
import { cn } from '@poveroh/ui/lib/utils'
import { KpiRow } from './widgets/kpi-row'
import { LiquidityEvolutionWidget } from './widgets/liquidity-evolution-widget'
import { IncomeExpenseMonthWidget } from './widgets/income-expense-month-widget'
import { MonthComparisonWidget } from './widgets/month-comparison-widget'
import { CategoryTrendWidget } from './widgets/category-trend-widget'
import { AccountBalancesWidget } from './widgets/account-balances-widget'
import { ExpenseMacroDistributionWidget } from './widgets/expense-macro-distribution-widget'
import { RecentTransactionsWidget } from './widgets/recent-transactions-widget'
import { NetWorthEvolutionWidget } from './widgets/net-worth-evolution-widget'
import { Button } from '@poveroh/ui/components/button'

const colSpanClass = (span: DashboardLayoutItem['colSpan']) => {
    switch (span) {
        case 3:
            return 'col-span-12 md:col-span-3'
        case 4:
            return 'col-span-12 md:col-span-4'
        case 6:
            return 'col-span-12 md:col-span-6'
        case 12:
        default:
            return 'col-span-12'
    }
}

type DashboardGridProps = {
    items: DashboardLayoutItem[]
    onReorder: (items: DashboardLayoutItem[]) => void
}

export const DashboardGrid = ({ items, onReorder }: DashboardGridProps) => {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

    const renderWidget = useMemo(
        // eslint-disable-next-line react/display-name
        () => (id: DashboardWidgetId) => {
            switch (id) {
                case 'net-worth-evolution':
                    return <NetWorthEvolutionWidget />
                case 'kpi-row':
                    return <KpiRow />
                case 'liquidity-evolution':
                    return <LiquidityEvolutionWidget />
                case 'income-expense-month':
                    return <IncomeExpenseMonthWidget />
                case 'month-comparison':
                    return <MonthComparisonWidget />
                case 'category-trend':
                    return <CategoryTrendWidget />
                case 'account-balances':
                    return <AccountBalancesWidget />
                case 'expense-macro-distribution':
                    return <ExpenseMacroDistributionWidget />
                case 'recent-transactions':
                    return <RecentTransactionsWidget />
                default:
                    return null
            }
        },
        []
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (!over || active.id === over.id) return

        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return

        onReorder(arrayMove(items, oldIndex, newIndex))
    }

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(item => item.id)}>
                <div className='grid grid-cols-12 gap-6'>
                    {items
                        .filter(item => item.visible !== false)
                        .map(item => (
                            <SortableWidget key={item.id} id={item.id} className={colSpanClass(item.colSpan)}>
                                <div className='w-full'>{renderWidget(item.id)}</div>
                            </SortableWidget>
                        ))}
                </div>
            </SortableContext>
        </DndContext>
    )
}

type SortableWidgetProps = PropsWithChildren<{ id: DashboardWidgetId; className?: string }>

const SortableWidget = ({ id, className, children }: SortableWidgetProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(isDragging && 'shadow-lg ring-1 ring-primary/30', 'relative group', className)}
        >
            <div className='absolute top-2 left-[-3rem] opacity-0 group-hover:opacity-100 transition-opacity'>
                <Button variant='ghost' size='icon' className='cursor-grab' {...attributes} {...listeners}>
                    <GripVertical className='h-4 w-4' />
                </Button>
            </div>
            {children}
        </div>
    )
}
