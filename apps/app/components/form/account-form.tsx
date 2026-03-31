'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'

import { Form } from '@poveroh/ui/components/form'

import { useFinancialAccount } from '@/hooks/use-account'
import { useFinancialAccountForm } from '@/hooks/form/use-account-form'
import { FileUploadField, TextField } from '../fields'
import { SelectField } from '../fields/select-field'
import { FormProps, FormRef } from '@/types'
import { CreateFinancialAccountRequest, FinancialAccountData, UpdateFinancialAccountRequest } from '@poveroh/types'
import { Item } from '@poveroh/types'

export const AccountForm = forwardRef<
    FormRef,
    FormProps<CreateFinancialAccountRequest | UpdateFinancialAccountRequest>
>((props: FormProps<FinancialAccountData>, ref) => {
    const { initialData, inEditingMode, dataCallback } = props

    const t = useTranslations()
    const { ACCOUNT_TYPE_CATALOG } = useFinancialAccount()
    const { form, setFile, handleSubmit } = useFinancialAccountForm(initialData, inEditingMode)

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
                    <TextField control={form.control} name='title' label={t('form.title.label')} mandatory />

                    <SelectField
                        control={form.control}
                        name='type'
                        label={t('form.type.label')}
                        options={ACCOUNT_TYPE_CATALOG}
                        placeholder={t('form.type.placeholder')}
                        getOptionLabel={(item: Item) => item.label}
                        getOptionValue={(item: Item) => item.value}
                        mandatory
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
