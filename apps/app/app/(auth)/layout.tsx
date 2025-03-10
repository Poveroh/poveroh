import { Logo } from '@poveroh/ui/components/logo'
import Link from 'next/link'

type DefaultAuthLayout = Readonly<{
    children: React.ReactNode
}>

export default function AuthLayout({ children }: DefaultAuthLayout) {
    return (
        <div className='flex h-screen'>
            <div className='flex flex-col items-center md:items-start w-full lg:w-1/2 h-full p-12'>
                <div className='flex flex-col w-full h-full'>
                    <Link href='/sign-in'>
                        <Logo color='white' mode='horizontal' width={120} height={50}></Logo>
                    </Link>
                    <div className='flex items-center flex-1'>{children}</div>
                </div>
            </div>
            <div className='hidden lg:flex justify-center items-center h-full w-1/2 bg-special-pattern box-rounded-just-left'></div>
        </div>
    )
}
