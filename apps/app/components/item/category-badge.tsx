import DynamicIcon from '../icon/dynamic-icon'
import { ICategory, ISubcategory } from '@poveroh/types'

type CategoryBadgeProps =
    | {
          category: ICategory
          compact?: boolean
          variant?: 'category'
      }
    | {
          variant: 'subcategory'
          subcategory: ISubcategory
          color?: string
          compact?: boolean
          showConnector?: boolean
      }

export function CategoryBadge(props: CategoryBadgeProps) {
    if ('subcategory' in props) {
        const { subcategory, color = '#ffffff', compact = false, showConnector = !compact } = props

        const baseStyle = {
            backgroundColor: `${color}20`,
            color
        }

        const chip = (
            <div
                className={
                    compact
                        ? 'inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm'
                        : 'flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm'
                }
                style={baseStyle}
            >
                <DynamicIcon name={subcategory.logoIcon} className='w-4 h-4' />
                <span style={{ color }}>{subcategory.title}</span>
            </div>
        )

        if (!compact && showConnector) {
            return (
                <div className='flex flex-row items-center space-x-5' style={{ color }}>
                    <DynamicIcon name='corner-down-right' className='w-5 h-5' />
                    {chip}
                </div>
            )
        }

        return chip
    }

    const { category, compact = false } = props

    const chip = (
        <div
            className={
                compact
                    ? 'inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm'
                    : 'flex items-center space-x-3 px-4 py-2 rounded-full'
            }
            style={{ backgroundColor: `${category.color}20`, color: category.color }}
        >
            <DynamicIcon name={category.logoIcon} className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
            <span style={{ color: category.color }}>{category.title}</span>
        </div>
    )

    if (compact) {
        return chip
    }

    return <div className='flex flex-row items-center space-x-5'>{chip}</div>
}
