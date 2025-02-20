import { useState } from 'react'
import { Input } from '@poveroh/ui/components/input'
import { Button } from '@poveroh/ui/components/button'
import { Eye, EyeOff } from 'lucide-react'

export default function PasswordInput(props: any) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className='relative w-full'>
            <Input {...props} type={showPassword ? 'text' : 'password'} autoComplete='password' />
            <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-2 top-1/2 -translate-y-1/2'
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </Button>
        </div>
    )
}
