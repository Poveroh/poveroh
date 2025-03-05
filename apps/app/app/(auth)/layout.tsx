import { appConfig } from '@/config'
import { Logo } from '@poveroh/ui/components/logo'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: {
        template: '%s | ' + appConfig.name,
        default: appConfig.name
    }
}

type LoginLayoutProps = Readonly<{
    children: React.ReactNode
}>

export default function LoginLayout({ children }: LoginLayoutProps) {
    return (
        <>
            <div className='flex h-screen'>
                <div className='flex flex-col w-1/2 h-full p-12'>
                    <div className='flex flex-col h-full'>
                        <Link href='/sign-in'>
                            <Logo color='white' mode='horizontal' width={120} height={50}></Logo>
                        </Link>
                        <div className='flex items-center flex-1'>{children}</div>
                    </div>
                </div>
                <div className='flex justify-center items-center h-full w-1/2 bg-special-pattern box-rounded-just-left'></div>
            </div>
        </>
    )
}
