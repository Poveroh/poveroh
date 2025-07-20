'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'

import { FormRef, ICategory, IItem } from '@poveroh/types'

import { Form } from '@poveroh/ui/components/form'
import { TextField } from '@/components/fields/TextField'
import { NoteField } from '@/components/fields/NoteField'
import { SelectField } from '@/components/fields/SelectField'
import { IconField } from '@/components/fields/IconField'
import { useCategoryForm } from '@/hooks/form/useCategoryForm'

type FormProps = {
    initialData?: ICategory | null
    inEditingMode: boolean
    dataCallback: (formData: FormData) => Promise<void>
    closeDialog: () => void
}

export const CategoryForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const t = useTranslations()

    const { initialData, inEditingMode, dataCallback } = props

    const { form, icon, handleSubmit, handleIconChange, actionList, iconList } = useCategoryForm(
        initialData,
        inEditingMode
    )

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(values => handleSubmit(values, dataCallback))()
        }
    }))

    return (
        <Form {...form}>
            <form className='flex flex-col space-y-10'>
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
                        iconList={iconList}
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
