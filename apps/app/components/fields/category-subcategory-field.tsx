import { useEffect, useState } from 'react'
import { CategoryField } from './category-field'
import { SubcategoryField } from './subcategory-field'
import { ISubcategory } from '@poveroh/types'
import { useCategoryStore } from '@/store/category.store'
import { CategorySubcategoryFieldProps } from '@/types'
import { FieldValues, Path } from 'react-hook-form'
import { useTranslations } from 'next-intl'

export function CategorySubcategoryField<T extends FieldValues = FieldValues>(props: CategorySubcategoryFieldProps<T>) {
    const t = useTranslations()
    const { categoryCacheList } = useCategoryStore()

    const [subcategoryList, setSubcategoryList] = useState<ISubcategory[]>([])

    useEffect(() => {
        const initialCategoryId = props.categoryId || props.form?.getValues('categoryId') || ''
        if (initialCategoryId) {
            parseSubcategoryList(initialCategoryId)
        }
    }, [categoryCacheList])

    const parseSubcategoryList = async (categoryId: string) => {
        const category = categoryCacheList.find(item => item.id === categoryId)
        const res = category ? category.subcategories : []
        props.form?.setValue('subcategoryId', res[0]?.id || '')
        setSubcategoryList(res)
    }

    return (
        <div className='flex flex-row space-x-2'>
            <CategoryField
                control={props.control}
                name={'categoryId' as Path<T>}
                label={t('form.category.label')}
                placeholder={t('form.category.placeholder')}
                onValueChange={categoryId => {
                    parseSubcategoryList(categoryId)
                }}
            />
            <SubcategoryField
                {...props}
                name={'subcategoryId' as Path<T>}
                label={t('form.subcategory.label')}
                placeholder={t('form.subcategory.placeholder')}
                subcategories={subcategoryList}
            />
        </div>
    )
}
