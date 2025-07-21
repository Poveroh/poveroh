import { ReactNode } from 'react'
import DynamicIcon from '@/components/icon/DynamicIcon'
import { BrandIcon } from '@/components/icon/BrandIcon'
import icons from 'currency-icons'

export interface IconRenderOptions {
    type: 'dynamic' | 'brand' | 'currency'
    size?: 'sm' | 'xl'
    className?: string
}

export const useFieldIcon = () => {
    const renderFieldIcon = (iconName: string, options: IconRenderOptions): ReactNode => {
        const { type, size = 'sm', className = 'h-4 w-4' } = options

        switch (type) {
            case 'dynamic':
                return <DynamicIcon name={iconName} className={className} />
            case 'brand':
                return <BrandIcon icon={iconName} size={size} />
            case 'currency':
                return <span>{icons[iconName]?.symbol || ''}</span>
            default:
                return null
        }
    }

    const createIconContent = (iconName: string, title: string, options: IconRenderOptions): ReactNode => (
        <div className='flex items-center flex-row space-x-4'>
            {renderFieldIcon(iconName, options)}
            <span>{title}</span>
        </div>
    )

    return {
        renderFieldIcon,
        createIconContent
    }
}
