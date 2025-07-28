'use client'

import { forwardRef, useState, useImperativeHandle } from 'react'
import { FormRef, TransactionFormProps } from '@/types/form'
import { useTransactionForm } from '@/hooks/form/use-transaction-form'
import { TransactionAction, ISubcategory, ICategory } from '@poveroh/types'

import { Form } from '@poveroh/ui/components/form'

import { useTranslations } from 'next-intl'
import {
    CurrencyField,
    DateField,
    NoteField,
    TextField,
    AccountField,
    CategoryField,
    SubcategoryField,
    IgnoreField,
    FileUploadField,
    AmountField
} from '@/components/fields'
import { useCategoryStore } from '@/store/category.store'
import { useAccountStore } from '@/store/account.store'

export const IncomeForm = forwardRef<FormRef, TransactionFormProps>((props, ref) => {
    const { dataCallback } = props

    const t = useTranslations()
    const { form, file, setFile, handleSubmit } = useTransactionForm(TransactionAction.INCOME, props)

    // Store hooks
    const { categoryCacheList } = useCategoryStore()
    const { accountCacheList } = useAccountStore()

    // Local state
    const [subcategoryList, setSubcategoryList] = useState<ISubcategory[]>([])

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(values => handleSubmit(values, dataCallback))()
        }
    }))

    const inputStyle = props.inputStyle

    const parseSubcategoryList = async (categoryId: string) => {
        const category = categoryCacheList.find((item: ICategory) => item.id === categoryId)
        const res = category ? category.subcategories : []
        setSubcategoryList(res)
    }

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
                            control={form.control}
                            name='currency'
                            label={t('form.currency.label')}
                            placeholder={t('form.currency.placeholder')}
                            mandatory={true}
                            variant={inputStyle}
                        />
                    </div>

                    <AccountField
                        control={form.control}
                        name='accountId'
                        label={t('form.account.label')}
                        placeholder={t('form.account.placeholder')}
                        mandatory={true}
                        variant={inputStyle}
                        accounts={accountCacheList}
                    />

                    <div className='flex flex-row space-x-2'>
                        <CategoryField
                            control={form.control}
                            name='categoryId'
                            label={t('form.category.label')}
                            placeholder={t('form.category.placeholder')}
                            mandatory={true}
                            variant={inputStyle}
                            categories={categoryCacheList}
                            onCategoryChange={categoryId => {
                                parseSubcategoryList(categoryId)
                            }}
                        />
                        <SubcategoryField
                            control={form.control}
                            name='subcategoryId'
                            label={t('form.subcategory.label')}
                            placeholder={t('form.subcategory.placeholder')}
                            mandatory={true}
                            variant={inputStyle}
                            subcategories={subcategoryList}
                        />
                    </div>

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
