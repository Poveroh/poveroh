import { Button } from '@poveroh/ui'
import { Input } from '@poveroh/ui'
import { MailOpen } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    return (
        <>
            <div className='flex flex-col space-y-14 w-[500px]'>
                <div className='flex flex-col space-y-3'>
                    <h3>{'login.title'}</h3>
                    <p className='sub'>{'login.subtitle'}</p>
                </div>
                <form className='flex flex-col space-y-14'>
                    <div className='flex flex-col space-y-6'>
                        <Input type='email' placeholder='Email' />
                        <Button>
                            <MailOpen /> Ciao
                        </Button>
                    </div>
                    <div className='flex flex-col space-y-6'>
                        <div className='flex justify-end w-full'>
                            <Link href='/change-password' className='items-self-end'>
                                {'login.buttons.forgotPassword'}
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}
