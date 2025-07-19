import * as React from 'react'

import { cn } from '@poveroh/ui/lib/utils'
import { InputProps } from '@poveroh/types'

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, variant = 'contained', startIcon, endIcon, ...props }, ref) => {
        const StartIcon = startIcon
        const EndIcon = endIcon

        return (
            <div className={cn('w-full relative rounded-md', className)}>
                {StartIcon && (
                    <div className='absolute left-5 top-1/2 transform -translate-y-1/2'>
                        <StartIcon size={18} className='text-muted-foreground' />
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-11 w-full rounded-md bg-input px-4 py-4 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-base',
                        startIcon ? 'pl-14' : '',
                        endIcon ? 'pr-14' : '',
                        variant === 'outlined' ? 'border' : ''
                    )}
                    ref={ref}
                    {...props}
                />
                {EndIcon && (
                    <div className='absolute right-5 top-1/2 transform -translate-y-1/2'>
                        <EndIcon className='text-muted-foreground' size={18} />
                    </div>
                )}
            </div>
        )
    }
)
Input.displayName = 'Input'

export { Input }
