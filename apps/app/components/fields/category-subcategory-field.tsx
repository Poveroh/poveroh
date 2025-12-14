import { useEffect, useState, useCallback } from 'react'
import { CategoryField } from './category-field'
import { SubcategoryField } from './subcategory-field'
import { ISubcategory } from '@poveroh/types'
import { useCategoryStore } from '@/store/category.store'
import { CategorySubcategoryFieldProps } from '@/types'
import { FieldValues, Path } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { useCategory } from '@/hooks/use-category'

export function CategorySubcategoryField<T extends FieldValues = FieldValues>(props: CategorySubcategoryFieldProps<T>) {
    const t = useTranslations()
    const { categoryCacheList } = useCategoryStore()
    const { fetchCategory } = useCategory()

    const [subcategoryList, setSubcategoryList] = useState<ISubcategory[]>([])

    const parseSubcategoryList = useCallback(
        async (categoryId: string) => {
            const category = categoryCacheList.find(item => item.id === categoryId)
            const res = category ? category.subcategories : []
            props.form?.setValue(props.subcategoryName, (res[0]?.id || '') as T[Path<T>])
            setSubcategoryList(res)
        },
        [categoryCacheList, props.form, props.subcategoryName]
    )

    useEffect(() => {
        const initializeComponent = async () => {
            if (categoryCacheList.length === 0) {
                await fetchCategory()
            }

            const initialCategoryId = props.categoryId || (props.form?.getValues(props.name!) as string) || ''
            if (initialCategoryId) {
                parseSubcategoryList(initialCategoryId)
            }
        }

        initializeComponent()
    }, [categoryCacheList, props.categoryId, props.form, props.name, parseSubcategoryList])

    return (
        <div className='flex flex-row space-x-2'>
            <CategoryField
                {...props}
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
