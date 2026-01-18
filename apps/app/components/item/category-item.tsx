import DynamicIcon from '../icon/dynamic-icon'
import { CategoryModelMode, ICategory, ISubcategory } from '@poveroh/types'
import { OptionsPopover } from '../navbar/options-popover'
import { useTranslations } from 'next-intl'
import { CategoryBadge } from './category-badge'

type CategoryItemProps = {
    category: ICategory
    openDelete: (mode: CategoryModelMode, item: ICategory | ISubcategory) => void
    openEdit: (mode: CategoryModelMode, item: ICategory | ISubcategory) => void
}

export function CategoryItem({ category, openDelete, openEdit }: CategoryItemProps) {
    const t = useTranslations()

    return (
        <>
            <div className='border-border'>
                <div
                    className='flex flex-row justify-between items-center w-full p-5 border-border cursor-pointer hover:bg-accent/50 transition-colors'
                    onClick={() => openEdit('category', category)}
                >
                    <CategoryBadge category={category} />
                    <OptionsPopover<ICategory>
                        data={category}
                        buttons={[
                            {
                                onClick: item => openEdit('category', item),
                                label: t('buttons.editItem'),
                                icon: 'pencil'
                            },
                            {
                                onClick: item => openDelete('category', item),
                                variant: 'danger',
                                label: t('buttons.deleteItem'),
                                icon: 'trash-2'
                            }
                        ]}
                    ></OptionsPopover>
                </div>
                {category.subcategories?.map((subcategory: ISubcategory) => (
                    <div
                        key={subcategory.id}
                        className='flex flex-row justify-between items-center w-full pl-10 pr-5 p-2 border-border cursor-pointer hover:bg-accent/50 transition-colors'
                        onClick={() => openEdit('subcategory', subcategory)}
                    >
                        <CategoryBadge variant='subcategory' subcategory={subcategory} color={category.color} />
                        <OptionsPopover<ISubcategory>
                            data={subcategory}
                            buttons={[
                                {
                                    onClick: item => openEdit('subcategory', item),
                                    label: t('buttons.editItem'),
                                    icon: 'pencil'
                                },
                                {
                                    onClick: item => openDelete('subcategory', item),
                                    variant: 'danger',
                                    label: t('buttons.deleteItem'),
                                    icon: 'trash-2'
                                }
                            ]}
                        ></OptionsPopover>
                    </div>
                ))}
            </div>
        </>
    )
}
