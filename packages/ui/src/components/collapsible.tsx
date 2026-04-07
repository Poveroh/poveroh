'use client'

import * as React from 'react'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { ChevronDown } from 'lucide-react'

import { cn } from '@poveroh/ui/lib/utils'

const Collapsible = React.forwardRef<
    React.ElementRef<typeof CollapsiblePrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>
>(({ className, ...props }, ref) => (
    <CollapsiblePrimitive.Root ref={ref} className={cn('group', className)} {...props} />
))
Collapsible.displayName = 'Collapsible'

const CollapsibleTrigger = React.forwardRef<
    React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
    React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger>
>(({ className, children, ...props }, ref) => (
    <CollapsiblePrimitive.CollapsibleTrigger
        ref={ref}
        className={cn(
            'flex w-full items-center gap-3 p-3 text-sm bg-box text-muted-foreground hover:text-foreground transition-colors',
            className
        )}
        {...props}
    >
        <span className='flex items-center gap-1.5'>
            <ChevronDown className='h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180' />
            {children}
        </span>
    </CollapsiblePrimitive.CollapsibleTrigger>
))
CollapsibleTrigger.displayName = 'CollapsibleTrigger'

const CollapsibleContent = React.forwardRef<
    React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
    React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ className, ...props }, ref) => (
    <CollapsiblePrimitive.CollapsibleContent ref={ref} className={cn('pt-4', className)} {...props} />
))
CollapsibleContent.displayName = 'CollapsibleContent'

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
