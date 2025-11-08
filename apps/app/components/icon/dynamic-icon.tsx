'use client'

import dynamicIconImports from 'lucide-react/dynamicIconImports'
import dynamic from 'next/dynamic'
import { FC, memo } from 'react'

type IconName = keyof typeof dynamicIconImports

const icons = Object.keys(dynamicIconImports) as IconName[]

type ReactComponent = FC<{ className?: string }>
const icons_components = {} as Record<IconName, ReactComponent>

for (const name of icons) {
    const NewIcon = dynamic(dynamicIconImports[name], {
        ssr: false
    }) as ReactComponent
    icons_components[name] = NewIcon
}

export type DynamicIconProps = {
    name: string
    className?: string
}

const DynamicIconComponent: FC<DynamicIconProps> = ({ name, ...props }: DynamicIconProps) => {
    const Icon = icons_components[name as IconName]
    if (!Icon) return null
    return <Icon {...props} />
}

const DynamicIcon = memo(DynamicIconComponent)
DynamicIcon.displayName = 'DynamicIcon'

export default DynamicIcon
