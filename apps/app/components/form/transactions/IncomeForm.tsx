'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'
import { z } from 'zod'

import { FormProps, FormRef, TransactionAction, Currencies } from '@poveroh/types'
import { Form } from '@poveroh/ui/components/form'
import { useTransactionForm } from '@/hooks/form/useTransactionForm'
import { amountSchema } from '@/types/form'
import {
    TextField,
    DateField,
    AmountField,
    CurrencyField,
    BankAccountField,
    CategoryField,
    SubcategoryField,
    NoteField,
    FileUploadField,
    IgnoreField
} from '@/components/field'

export const IncomeForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const t = useTranslations()
    const { initialData, inputStyle, dataCallback } = props

    // Custom schema for income transactions
    const incomeSchema = z.object({
        title: z.string().nonempty(t('messages.errors.required')),
        date: z.string({
            required_error: t('messages.errors.required')
        }),
        amount: amountSchema({
            requiredError: t('messages.errors.required'),
            invalidTypeError: t('messages.errors.pattern')
        }),
        currency: z.string().nonempty(t('messages.errors.required')),
        bankAccountId: z.string().nonempty(t('messages.errors.required')),
        categoryId: z.string().nonempty(t('messages.errors.required')),
        subcategoryId: z.string().nonempty(t('messages.errors.required')),
        note: z.string(),
        ignore: z.boolean()
    })

    const {
        form,
        subcategoryList,
        parseSubcategoryList,
        file,
        setFile,
        fileError,
        setFileError,
        handleSubmit,
        categoryCacheList,
        bankAccountCacheList
    } = useTransactionForm<z.infer<typeof incomeSchema>>({
        initialData,
        action: TransactionAction.INCOME,
        onSubmit: dataCallback,
        customSchema: incomeSchema
    })

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(handleSubmit)()
        }
    }))

    return (
        <Form {...form}>
            <form>
                <div className='flex flex-col space-y-6'>
                    <TextField control={form.control} label={t('form.title.label')} variant={inputStyle} />

                    <DateField control={form.control} label={t('form.date.label')} variant={inputStyle} />

                    <div className='flex flex-row space-x-2'>
                        <AmountField
                            control={form.control}
                            label={t('form.amount.label')}
                            placeholder={t('form.amount.placeholder')}
                            variant={inputStyle}
                        />

                        <CurrencyField
                            control={form.control}
                            label={t('form.currency.label')}
                            placeholder={t('form.currency.placeholder')}
                            variant={inputStyle}
                        />
                    </div>

                    <BankAccountField
                        control={form.control}
                        label={t('form.bankaccount.label')}
                        placeholder={t('form.bankaccount.placeholder')}
                        variant={inputStyle}
                        bankAccounts={bankAccountCacheList}
                    />

                    <div className='flex flex-row space-x-2'>
                        <CategoryField
                            control={form.control}
                            label={t('form.category.label')}
                            placeholder={t('form.category.placeholder')}
                            variant={inputStyle}
                            categories={categoryCacheList}
                            onCategoryChange={parseSubcategoryList}
                        />

                        <SubcategoryField
                            control={form.control}
                            label={t('form.subcategory.label')}
                            placeholder={t('form.subcategory.placeholder')}
                            variant={inputStyle}
                            subcategories={subcategoryList}
                        />
                    </div>

                    <NoteField
                        control={form.control}
                        label={t('form.note.label')}
                        placeholder={t('form.note.placeholder')}
                        variant={inputStyle}
                    />

                    <FileUploadField
                        label={t('form.file.label')}
                        file={file}
                        onFileChange={files => {
                            setFile(files)
                            setFileError(false)
                        }}
                        fileError={fileError}
                        errorMessage={t('messages.errors.required')}
                        toUploadMessage={t('messages.toUpload')}
                    />

                    <IgnoreField control={form.control} label={t('form.ignore.label')} />
                </div>
            </form>
        </Form>
    )
})

IncomeForm.displayName = 'IncomeForm'
