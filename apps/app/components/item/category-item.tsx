import DynamicIcon from '../icon/dynamic-icon'
import { CategoryModelMode, ICategory, ISubcategory } from '@poveroh/types'
import { OptionsPopover } from '../navbar/options-popover'

type CategoryItemProps = {
    category: ICategory
    openDelete: (mode: CategoryModelMode, item: ICategory | ISubcategory) => void
    openEdit: (mode: CategoryModelMode, item: ICategory | ISubcategory) => void
}

export function CategoryItem({ category, openDelete, openEdit }: CategoryItemProps) {
    return (
        <>
            <div className='border-border'>
                <div
                    className='flex flex-row justify-between items-center w-full p-5 border-border cursor-pointer hover:bg-accent/50 transition-colors'
                    onClick={() => openEdit('category', category)}
                >
                    <div className='flex flex-row items-center space-x-5'>
                        <div
                            className='flex items-center space-x-3 px-4 py-2 rounded-full'
                            style={{ backgroundColor: `${category.color}20`, color: category.color }}
                        >
                            <DynamicIcon name={category.logoIcon} className='w-5 h-5' />
                            <span style={{ color: category.color }}>{category.title}</span>
                        </div>
                    </div>
                    <OptionsPopover<ICategory>
                        data={category}
                        openDelete={item => openDelete('category', item)}
                        openEdit={item => openEdit('category', item)}
                    ></OptionsPopover>
                </div>
                {category.subcategories?.map((subcategory: ISubcategory) => (
                    <div
                        key={subcategory.id}
                        className='flex flex-row justify-between items-center w-full pl-10 pr-5 p-2 border-border cursor-pointer hover:bg-accent/50 transition-colors'
                        onClick={() => openEdit('subcategory', subcategory)}
                    >
                        <div className='flex flex-row items-center space-x-5' style={{ color: category.color }}>
                            <DynamicIcon name='corner-down-right' className='w-5 h-5' />
                            <div
                                className='flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm'
                                style={{ backgroundColor: `${category.color}20`, color: category.color }}
                            >
                                <DynamicIcon name={subcategory.logoIcon} className='w-4 h-4' />
                                <span style={{ color: category.color }}>{subcategory.title}</span>
                            </div>
                        </div>
                        <OptionsPopover<ISubcategory>
                            data={subcategory}
                            openDelete={item => openDelete('subcategory', item)}
                            openEdit={item => openEdit('subcategory', item)}
                        ></OptionsPopover>
                    </div>
                ))}
            </div>
        </>
    )
}
