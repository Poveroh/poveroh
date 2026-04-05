'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'

import { Form } from '@poveroh/ui/components/form'
import { TextField } from '@/components/fields/text-field'
import { CategoryField } from '@/components/fields/category-field'
import { PopoverIconLogo } from '@/components/fields/popover-icon-logo'
import { useSubcategoryForm } from '@/hooks/form/use-subcategory-form'
import { FormProps, FormRef } from '@/types'
import { CreateUpdateSubcategoryRequest, SubcategoryData } from '@poveroh/types'

type SubcategoryFormProps = FormProps<SubcategoryData, CreateUpdateSubcategoryRequest>

export const SubcategoryForm = forwardRef<FormRef, SubcategoryFormProps>((props: SubcategoryFormProps, ref) => {
    const { initialData, inEditingMode, dataCallback } = props

    const t = useTranslations()
    const { form, icon, handleSubmit, handleIconChange } = useSubcategoryForm(initialData, inEditingMode)

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(values => handleSubmit(values, dataCallback))()
        },
        reset: () => {
            form.reset()
        }
    }))

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
                            onIconChange={handleIconChange}
                            enableIcon={true}
                            enableLogo={false}
                            inEditingMode={inEditingMode}
                        />

                        <TextField control={form.control} name='title' label={t('form.title.label')} mandatory />
                    </div>

                    <TextField
                        control={form.control}
                        name='description'
                        label={t('form.description.label')}
                        mandatory={false}
                    />

                    <CategoryField
                        control={form.control}
                        name='categoryId'
                        label={t('form.category.label')}
                        placeholder={t('form.category.placeholder')}
                        mandatory={true}
                    />
                </div>
            </form>
        </Form>
    )
})

SubcategoryForm.displayName = 'SubcategoryForm'
