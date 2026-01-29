'use client'

import { PropsWithChildren, ReactNode } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { DashboardLayoutItem, DashboardWidgetId } from '@poveroh/types'
import { cn } from '@poveroh/ui/lib/utils'

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
    renderWidget: (id: DashboardWidgetId) => ReactNode
}

export const DashboardGrid = ({ items, onReorder, renderWidget }: DashboardGridProps) => {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

    const handleDragEnd = (event: any) => {
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
            className={cn(
                'rounded-lg border border-border/60 bg-background p-3 shadow-sm transition-shadow',
                isDragging && 'shadow-lg ring-1 ring-primary/30',
                className
            )}
        >
            <div className='flex items-center justify-end'>
                <button
                    type='button'
                    className='cursor-grab rounded-md p-1 text-muted-foreground hover:text-foreground'
                    aria-label='Sposta widget'
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className='h-4 w-4' />
                </button>
            </div>
            {children}
        </div>
    )
}
