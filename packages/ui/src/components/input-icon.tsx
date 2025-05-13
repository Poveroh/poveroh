import { Input } from '@poveroh/ui/components/input'
import { Button } from '@poveroh/ui/components/button'

function InputWithIcon(props: any) {
    return (
        <div className='relative w-full'>
            <Input {...props} />
            <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={props.onClick}
                className='absolute right-2 top-1/2 -translate-y-1/2'
            >
                {props.icon}
            </Button>
        </div>
    )
}

export { InputWithIcon }
