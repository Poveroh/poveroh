'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Form } from '@poveroh/ui/components/form'
import { TextField } from '@/components/fields/text-field'
import { CategoryField } from '@/components/fields/category-field'
import { PopoverIconLogo } from '@/components/fields/popover-icon-logo'
import { useSubcategoryForm } from '@/hooks/form/use-subcategory-form'
import { FormProps, FormRef } from '@/types'
import { CreateUpdateSubcategoryRequest, SubcategoryData } from '@poveroh/types'
import { useCategory } from '@/hooks/use-category'

type SubcategoryFormProps = FormProps<SubcategoryData, CreateUpdateSubcategoryRequest>

export const SubcategoryForm = forwardRef<FormRef, SubcategoryFormProps>((props: SubcategoryFormProps, ref) => {
    const { initialData, dataCallback } = props

    const t = useTranslations()
    const { categoryData } = useCategory()
    const { form, icon, handleSubmit, handleIconChange } = useSubcategoryForm(initialData)

    const [selectedColor, setSelectedColor] = useState<string>('')

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(values => handleSubmit(values, dataCallback))()
        },
        reset: () => {
            form.reset()
        }
    }))

    function onCategoryChange(categoryId: string) {
        const category = categoryData.find(c => c.id === categoryId)
        if (category) {
            setSelectedColor(category.color!)
        }
    }

    return (
        <Form {...form}>
            <form
                className='flex flex-col space-y-10'
                onSubmit={e => {
                    e.preventDefault()
                }}
            >
                <div className='flex flex-col space-y-6'>
                    <div className='flex flex-row items-center space-x-7'>
                        <PopoverIconLogo
                            control={form.control}
                            selectedIcon={icon}
                            selectedColor={selectedColor}
                            onIconChange={handleIconChange}
                            enableIcon={true}
                            enableLogo={false}
                        />

                        <TextField control={form.control} name='title' label={t('form.title.label')} mandatory />
                    </div>

                    <CategoryField
                        control={form.control}
                        name='categoryId'
                        label={t('form.category.label')}
                        placeholder={t('form.category.placeholder')}
                        onValueChange={onCategoryChange}
                        mandatory={true}
                    />
                </div>
            </form>
        </Form>
    )
})

SubcategoryForm.displayName = 'SubcategoryForm'
