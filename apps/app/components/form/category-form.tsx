'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'

import { ICategory, IItem } from '@poveroh/types'

import { Form } from '@poveroh/ui/components/form'
import { TextField } from '@/components/fields/text-field'
import { NoteField } from '@/components/fields/note-field'
import { SelectField } from '@/components/fields/select-field'
import { IconField } from '@/components/fields/icon-field'
import { useCategoryForm } from '@/hooks/form/use-category-form'
import { FormProps, FormRef } from '@/types'

export const CategoryForm = forwardRef<FormRef, FormProps<ICategory>>((props: FormProps<ICategory>, ref) => {
    const { initialData, inEditingMode, dataCallback } = props

    const t = useTranslations()
    const { form, icon, handleSubmit, handleIconChange, actionList } = useCategoryForm(initialData, inEditingMode)

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
                    <TextField control={form.control} name='title' label={t('form.title.label')} mandatory={true} />

                    <NoteField
                        control={form.control}
                        name='description'
                        label={t('form.description.label')}
                        placeholder={t('form.description.placeholder')}
                        mandatory={false}
                    />

                    <SelectField
                        control={form.control}
                        name='for'
                        label={t('form.type.label')}
                        placeholder={t('form.type.placeholder')}
                        mandatory={true}
                        options={actionList}
                        getOptionLabel={(item: IItem) => item.label}
                        getOptionValue={(item: IItem) => item.value.toString()}
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

CategoryForm.displayName = 'CategoryForm'
