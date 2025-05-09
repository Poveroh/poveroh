import { Pencil, Trash2 } from 'lucide-react'
import DynamicIcon from '../icon/dynamicIcon'
import { categoryModelMode, ICategory, ISubcategory } from '@poveroh/types'

type CategoryItemProps = {
    category: ICategory
    openDelete: (mode: categoryModelMode, item: ICategory | ISubcategory) => void
    openEdit: (mode: categoryModelMode, item: ICategory | ISubcategory) => void
}

export function CategoryItem({ category, openDelete, openEdit }: CategoryItemProps) {
    return (
        <>
            <div className='border-border'>
                <div className='flex flex-row justify-between items-center w-full p-5 border-border'>
                    <div className='flex flex-row items-center space-x-5'>
                        <DynamicIcon name={category.logo_icon} />
                        <div>
                            <p>{category.title}</p>
                            <p className='sub'>{category.description}</p>
                        </div>
                    </div>
                    <div className='flex flex-col items-center'>
                        <div className='flex flex-row space-x-5 items-center'>
                            <Pencil className='cursor-pointer' onClick={() => openEdit('category', category)} />
                            <Trash2
                                className='danger cursor-pointer'
                                onClick={() => openDelete('category', category)}
                            />
                        </div>
                    </div>
                </div>
                {category.subcategories?.map((subcategory: ISubcategory) => (
                    <div
                        key={subcategory.id}
                        className='flex flex-row justify-between items-center w-full pl-20 p-5 border-border'
                    >
                        <div className='flex flex-row items-center space-x-5'>
                            <DynamicIcon name={subcategory.logo_icon} />
                            <div>
                                <p>{subcategory.title}</p>
                                <p className='sub'>{subcategory.description}</p>
                            </div>
                        </div>
                        <div className='flex flex-col items-center'>
                            <div className='flex flex-row space-x-5 items-center'>
                                <Pencil
                                    className='cursor-pointer'
                                    onClick={() => openEdit('subcategory', subcategory)}
                                />
                                <Trash2
                                    className='danger cursor-pointer'
                                    onClick={() => openDelete('subcategory', subcategory)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
