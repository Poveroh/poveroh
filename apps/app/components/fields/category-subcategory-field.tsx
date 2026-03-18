import { useEffect, useState, useCallback } from 'react'
import { CategoryField } from './category-field'
import { SubcategoryField } from './subcategory-field'
import { useCategoryStore } from '@/store/category.store'
import { CategorySubcategoryFieldProps } from '@/types'
import { FieldValues, Path } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { useCategory } from '@/hooks/use-category'
import { SubcategoryData } from '@poveroh/types/contracts'

export function CategorySubcategoryField<T extends FieldValues = FieldValues>(props: CategorySubcategoryFieldProps<T>) {
    const t = useTranslations()
    const { categoryCacheList } = useCategoryStore()
    const { fetchCategories } = useCategory()

    const [subcategoryList, setSubcategoryList] = useState<SubcategoryData[]>([])

    const parseSubcategoryList = useCallback(
        async (categoryId: string, options?: { forceSelectFirst?: boolean }) => {
            if (!categoryId) {
                setSubcategoryList([])
                if (props.form) {
                    props.form.setValue(props.subcategoryName, '' as T[Path<T>])
                }
                return
            }

            //TODO: fix and understand why categoryCacheList can be empty at this point, even after fetchCategories is called
            const category = categoryCacheList.find(item => item.id === categoryId)
            const res = category ? category.subcategories : ([] as SubcategoryData[])
            setSubcategoryList(res ?? [])

            const currentValue = props.form?.getValues(props.subcategoryName) as string | undefined
            const hasCurrentValue = currentValue ? res?.some(item => item.id === currentValue) : false

            if (options?.forceSelectFirst || !hasCurrentValue) {
                props.form?.setValue(props.subcategoryName, (res?.[0]?.id || '') as T[Path<T>])
            }
        },
        [categoryCacheList, props.form, props.subcategoryName]
    )

    useEffect(() => {
        const initializeComponent = async () => {
            if (categoryCacheList.length === 0) {
                await fetchCategories()
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
                    parseSubcategoryList(categoryId, { forceSelectFirst: true })
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
