import NavBar from '@/components/navbar/navbar'
import { RouteGuard } from '@/components/other/route-guard'
import { OnBoardingStep } from '@poveroh/types'

type AppLayoutProps = {
    children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <RouteGuard requiredStep={[OnBoardingStep.COMPLETED]} redirectTo='/onboarding'>
            <NavBar />
            <div className='w-full flex justify-center'>
                <div className='container pt-40 pb-20 mx-auto px-4'>{children}</div>
            </div>
        </RouteGuard>
    )
}
