'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'
import { useWatch } from 'react-hook-form'

import { ISubcategory } from '@poveroh/types'

import { Form } from '@poveroh/ui/components/form'
import { TextField } from '@/components/fields/text-field'
import { CategoryField } from '@/components/fields/category-field'
import { IconField } from '@/components/fields/icon-field'
import { useSubcategoryForm } from '@/hooks/form/use-subcategory-form'
import { FormProps, FormRef } from '@/types'
import DynamicIcon from '../icon/dynamic-icon'
import { Button } from '@poveroh/ui/components/button'
import { Popover, PopoverTrigger, PopoverContent } from '@poveroh/ui/components/popover'
import { Pencil } from 'lucide-react'

export const SubcategoryForm = forwardRef<FormRef, FormProps<ISubcategory>>((props: FormProps<ISubcategory>, ref) => {
    const { initialData, inEditingMode, dataCallback } = props

    const t = useTranslations()
    const { form, icon, handleSubmit, handleIconChange } = useSubcategoryForm(initialData, inEditingMode)

    const logoIcon = useWatch({ control: form.control, name: 'logoIcon' })

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
                    <div className='flex flex-row space-x-7'>
                        <div className='relative p-5 w-fit h-fit rounded-full bg-muted'>
                            <DynamicIcon name={logoIcon} className='w-5 h-5' />

                            <div className='absolute bottom-[-8px] right-[-8px]'>
                                <Popover>
                                    <PopoverTrigger asChild onClick={e => e.stopPropagation()}>
                                        <Button size='icon' variant='secondary' className='rounded-full w-7 h-7'>
                                            <Pencil className='w-2 h-2' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align='end' className='w-[40rem] max-h-[600px] overflow-y-auto'>
                                        <IconField
                                            label={t('form.icon.label')}
                                            selectedIcon={icon}
                                            onIconChange={handleIconChange}
                                            mandatory={!inEditingMode}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

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
