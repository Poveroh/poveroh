'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'

import { IAccount, IItem } from '@poveroh/types'

import { Form } from '@poveroh/ui/components/form'

import { useAccount } from '@/hooks/use-account'
import { useAccountForm } from '@/hooks/form/use-account-form'
import { FileUploadField, TextField } from '../fields'
import { SelectField } from '../fields/select-field'
import { FormProps, FormRef } from '@/types'

export const AccountForm = forwardRef<FormRef, FormProps<IAccount>>((props: FormProps<IAccount>, ref) => {
    const { initialData, inEditingMode, dataCallback } = props

    const t = useTranslations()
    const { typeList } = useAccount()
    const { form, setFile, handleSubmit } = useAccountForm(initialData, inEditingMode)

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

                    <TextField control={form.control} name='description' label={t('form.description.label')} />

                    <SelectField
                        control={form.control}
                        name='type'
                        label={t('form.type.label')}
                        options={typeList}
                        placeholder={t('form.type.placeholder')}
                        getOptionLabel={(item: IItem) => item.label}
                        getOptionValue={(item: IItem) => item.value}
                    />

                    <FileUploadField
                        label={t('form.icon.label')}
                        toUploadMessage={t('messages.toUpload')}
                        accept='image/*'
                        mandatory={!inEditingMode}
                        onFileChange={setFile}
                    />
                </div>
            </form>
        </Form>
    )
})

AccountForm.displayName = 'AccountForm'
