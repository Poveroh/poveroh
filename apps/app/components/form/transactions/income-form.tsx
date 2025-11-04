'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { FormRef, TransactionFormProps } from '@/types/form'

import { Form } from '@poveroh/ui/components/form'

import { useTranslations } from 'next-intl'
import {
    CurrencyField,
    DateField,
    NoteField,
    TextField,
    AccountField,
    IgnoreField,
    FileUploadField,
    AmountField
} from '@/components/fields'
import { CategorySubcategoryField } from '@/components/fields/category-subcategory-field'
import { useIncomeForm } from '@/hooks/form/use-income-form'

export const IncomeForm = forwardRef<FormRef, TransactionFormProps>((props, ref) => {
    const { dataCallback } = props

    const t = useTranslations()
    const { form, file, setFile, handleSubmit } = useIncomeForm(props)

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(values => handleSubmit(values, dataCallback))()
        }
    }))

    const inputStyle = props.inputStyle

    return (
        <Form {...form}>
            <form
                onSubmit={e => {
                    e.preventDefault()
                }}
            >
                <div className='flex flex-col space-y-6'>
                    <TextField
                        control={form.control}
                        name='title'
                        label={t('form.title.label')}
                        mandatory={true}
                        variant={inputStyle}
                    />

                    <DateField
                        control={form.control}
                        name='date'
                        label={t('form.date.label')}
                        mandatory={true}
                        variant={inputStyle}
                    />

                    <div className='flex flex-row space-x-2'>
                        <AmountField
                            control={form.control}
                            name='amount'
                            label={t('form.amount.label')}
                            placeholder={t('form.amount.placeholder')}
                            mandatory={true}
                            variant={inputStyle}
                        />
                        <CurrencyField
                            form={form}
                            control={form.control}
                            name='currency'
                            label={t('form.currency.label')}
                            placeholder={t('form.currency.placeholder')}
                            mandatory
                            variant={inputStyle}
                        />
                    </div>

                    <AccountField
                        form={form}
                        control={form.control}
                        name='financialAccountId'
                        label={t('form.account.label')}
                        placeholder={t('form.account.placeholder')}
                        mandatory={true}
                        variant={inputStyle}
                    />

                    <CategorySubcategoryField
                        form={form}
                        control={form.control}
                        name='categoryId'
                        subcategoryName='subcategoryId'
                        categoryId={props.initialData?.categoryId}
                        label={t('form.category.label')}
                        placeholder={t('form.category.placeholder')}
                        mandatory={true}
                    />

                    <NoteField
                        control={form.control}
                        name='note'
                        label={t('form.note.label')}
                        placeholder={t('form.note.placeholder')}
                        mandatory={false}
                        variant={inputStyle}
                    />

                    <FileUploadField
                        label={t('form.file.label')}
                        file={file}
                        onFileChange={files => {
                            setFile(files)
                        }}
                        toUploadMessage={t('messages.toUpload')}
                        mandatory={false}
                    />

                    <IgnoreField
                        control={form.control}
                        name='ignore'
                        label={t('form.ignore.label')}
                        mandatory={false}
                    />
                </div>
            </form>
        </Form>
    )
})

IncomeForm.displayName = 'IncomeForm'
