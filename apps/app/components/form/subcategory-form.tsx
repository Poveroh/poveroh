'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { Form } from '@poveroh/ui/components/form'
import { FormProps, FormRef } from '@/types'
import { TextField, IconField, CategoryField } from '../fields'
import { useSubcategoryForm } from '@/hooks/form/use-subcategory-form'
import { ISubcategory } from '@poveroh/types'
import { useTranslations } from 'next-intl'

export const SubcategoryForm = forwardRef<FormRef, FormProps<ISubcategory>>((props: FormProps<ISubcategory>, ref) => {
    const { initialData, inEditingMode, dataCallback } = props

    const t = useTranslations()
    const { form, icon, handleSubmit, handleIconChange } = useSubcategoryForm(initialData, inEditingMode)

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(values => handleSubmit(values, dataCallback))()
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
                    <TextField control={form.control} name='title' label={t('form.title.label')} mandatory />
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

                    <IconField
                        label={t('form.icon.label')}
                        selectedIcon={icon}
                        onIconChange={handleIconChange}
                        mandatory={!inEditingMode}
                    />
                </div>
            </form>
        </Form>
    )
})

SubcategoryForm.displayName = 'SubcategoryForm'
