import { ButtonsVariant } from '@poveroh/ui/components/button'

export type ExtraButton<T> = {
    label: string
    icon?: string
    variant?: ButtonsVariant
    onClick: (item: T) => void
    hide?: boolean
}
