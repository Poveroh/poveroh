import * as React from 'react'

import { cn } from '@poveroh/ui/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                'flex h-11 w-full rounded-md bg-input px-4 py-4 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-base',
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = 'Input'

export { Input }
