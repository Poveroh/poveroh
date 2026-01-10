import { CompanyInfoBar } from '@/components/navbar/company-info-bar'
import { Sidebar } from '@/components/other/sidebar'
import { SETTINGS_NAV } from '@/config/navbar'
import { ReactNode } from 'react'

export default function SettingsLayout({ children }: { children: ReactNode }) {
    return (
        <div className='flex flex-row h-full overflow-hidden gap-6'>
            <div className='h-full flex flex-col space-y-4'>
                <Sidebar content={SETTINGS_NAV} />
                <CompanyInfoBar />
            </div>
            <div className='flex-1 overflow-y-auto'>{children}</div>
        </div>
    )
}
