import * as React from 'react'

import { cn } from '@poveroh/ui/lib/utils'
import { InputVariantStyle } from '@poveroh/types'

type TextareaProps = React.ComponentProps<'textarea'> & {
    variant?: InputVariantStyle
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, variant = 'contained', ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    `flex min-h-[80px] w-full rounded-md border ${variant === 'contained' ? 'border-input' : 'border-white'} bg-input px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-base`,
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = 'Textarea'

export { Textarea }
