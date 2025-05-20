import NavBar from '@/components/navbar/Navbar'

type AppLayoutProps = {
    children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <>
            <NavBar />
            <div className='w-full flex justify-center'>
                <div className='container pt-40 pb-20 mx-auto px-4'>{children}</div>
            </div>
        </>
    )
}
