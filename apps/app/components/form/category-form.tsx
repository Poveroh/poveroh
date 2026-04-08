'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'
import { useWatch } from 'react-hook-form'

import { Form } from '@poveroh/ui/components/form'
import { TextField } from '@/components/fields/text-field'

import { SelectField } from '@/components/fields/select-field'
import { PopoverIconLogo } from '@/components/fields/popover-icon-logo'
import { useCategoryForm } from '@/hooks/form/use-category-form'
import { FormProps, FormRef } from '@/types'
import { CategoryData, CreateUpdateCategoryRequest, Item } from '@poveroh/types'
import { useTransaction } from '@/hooks/use-transaction'

type CategoryFormProps = FormProps<CategoryData, CreateUpdateCategoryRequest>

export const CategoryForm = forwardRef<FormRef, CategoryFormProps>((props: CategoryFormProps, ref) => {
    const { initialData, inEditingMode, dataCallback } = props

    const t = useTranslations()
    const { getActionList } = useTransaction()
    const { form, icon, handleSubmit, handleIconChange } = useCategoryForm(initialData, inEditingMode)

    const color = useWatch({ control: form.control, name: 'color' })

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
                            colorFieldName='color'
                            selectedIcon={icon}
                            selectedColor={color}
                            onIconChange={handleIconChange}
                            enableIcon={true}
                            enableLogo={false}
                            inEditingMode={inEditingMode}
                        />

                        <TextField control={form.control} name='title' label={t('form.title.label')} mandatory={true} />
                    </div>

                    <SelectField
                        control={form.control}
                        name='for'
                        label={t('form.type.label')}
                        placeholder={t('form.type.placeholder')}
                        mandatory={true}
                        options={getActionList(true)}
                        getOptionLabel={(item: Item) => item.label}
                        getOptionValue={(item: Item) => item.value.toString()}
                    />
                </div>
            </form>
        </Form>
    )
})

CategoryForm.displayName = 'CategoryForm'
