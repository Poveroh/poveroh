import { Input } from '@poveroh/ui/components/input'
import { Button } from '@poveroh/ui/components/button'
import { ReactNode, MouseEventHandler } from 'react'
import { InputProps } from '@poveroh/types'

type InputWithIconProps = InputProps & {
    icon: ReactNode
    onClick?: MouseEventHandler<HTMLButtonElement>
}
const InputWithIcon = ({ icon, onClick, ...props }: InputWithIconProps) => {
    return (
        <div className='relative w-full'>
            <Input {...props} />
            <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onClick}
                className='absolute right-2 top-1/2 -translate-y-1/2'
            >
                {icon}
            </Button>
        </div>
    )
}

export { InputWithIcon }
