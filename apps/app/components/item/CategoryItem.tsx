import DynamicIcon from '../icon/DynamicIcon'
import { CategoryModelMode, ICategory, ISubcategory } from '@poveroh/types'
import { OptionsPopover } from '../navbar/OptionsPopover'

type CategoryItemProps = {
    category: ICategory
    openDelete: (mode: CategoryModelMode, item: ICategory | ISubcategory) => void
    openEdit: (mode: CategoryModelMode, item: ICategory | ISubcategory) => void
}

export function CategoryItem({ category, openDelete, openEdit }: CategoryItemProps) {
    return (
        <>
            <div className='border-border'>
                <div className='flex flex-row justify-between items-center w-full p-5 border-border'>
                    <div className='flex flex-row items-center space-x-5'>
                        <DynamicIcon name={category.logoIcon} />
                        <div>
                            <p>{category.title}</p>
                            <p className='sub'>{category.description}</p>
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
                        className='flex flex-row justify-between items-center w-full pl-20 p-5 border-border'
                    >
                        <div className='flex flex-row items-center space-x-5'>
                            <DynamicIcon name={subcategory.logoIcon} />
                            <div>
                                <p>{subcategory.title}</p>
                                <p className='sub'>{subcategory.description}</p>
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
