'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'
import { useWatch } from 'react-hook-form'

import { ICategory, IItem } from '@poveroh/types'

import { Form } from '@poveroh/ui/components/form'
import { TextField } from '@/components/fields/text-field'
import { NoteField } from '@/components/fields/note-field'
import { SelectField } from '@/components/fields/select-field'
import { IconField } from '@/components/fields/icon-field'
import { ColorField } from '@/components/fields/color-field'
import { useCategoryForm } from '@/hooks/form/use-category-form'
import { FormProps, FormRef } from '@/types'
import DynamicIcon from '../icon/dynamic-icon'
import { Button } from '@poveroh/ui/components/button'
import { Popover, PopoverTrigger, PopoverContent } from '@poveroh/ui/components/popover'
import { Ellipsis, Pencil } from 'lucide-react'

export const CategoryForm = forwardRef<FormRef, FormProps<ICategory>>((props: FormProps<ICategory>, ref) => {
    const { initialData, inEditingMode, dataCallback } = props

    const t = useTranslations()
    const { form, icon, handleSubmit, handleIconChange, actionList } = useCategoryForm(initialData, inEditingMode)

    const color = useWatch({ control: form.control, name: 'color' })
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
                        <div
                            className='relative p-5 w-fit h-fit rounded-full'
                            style={{ backgroundColor: `${color}20`, color: color }}
                        >
                            <DynamicIcon name={logoIcon} className='w-5 h-5' />

                            <div className='absolute bottom-[-8px] right-[-8px]'>
                                <Popover>
                                    <PopoverTrigger asChild onClick={e => e.stopPropagation()}>
                                        <Button size='icon' variant='secondary' className='rounded-full w-7 h-7'>
                                            <Pencil className='w-2 h-2' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align='end' className='w-[40rem] max-h-[600px] overflow-y-auto'>
                                        <div className='flex flex-col space-y-6'>
                                            <ColorField
                                                control={form.control}
                                                name='color'
                                                label={t('form.color.label')}
                                                mandatory={true}
                                            />

                                            <IconField
                                                label={t('form.icon.label')}
                                                selectedIcon={icon}
                                                onIconChange={handleIconChange}
                                                mandatory={!inEditingMode}
                                            />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <TextField control={form.control} name='title' label={t('form.title.label')} mandatory={true} />
                    </div>

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
                </div>
            </form>
        </Form>
    )
})

CategoryForm.displayName = 'CategoryForm'
