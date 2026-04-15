'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'
import { FormRef, TransactionFormProps } from '@/types/form'
import { Button } from '@poveroh/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { Merge, Plus, Split, Trash2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { BrandIcon } from '@/components/icon/brand-icon'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import {
    CurrencyField,
    DateField,
    NoteField,
    TextField,
    IgnoreField,
    FileUploadField,
    AccountField,
    AmountField
} from '@/components/fields'
import { useFinancialAccountStore } from '@/store/account.store'
import { CategorySubcategoryField } from '@/components/fields/category-subcategory-field'
import { useTransactionForm } from '@/hooks/form/use-transaction-form'
import { FinancialAccountData } from '@poveroh/types'

export const ExpensesForm = forwardRef<FormRef, TransactionFormProps>((props, ref) => {
    const t = useTranslations()
    const { financialAccountCacheList } = useFinancialAccountStore()
    const { form, file, fieldArray, setFile, onSubmit, calculateTotal } = useTransactionForm('EXPENSES', props)

    const [multipleAmount, setMultipleAmount] = useState(() => (props.initialData?.amounts?.length ?? 1) > 1)

    useImperativeHandle(ref, () => ({
        submit: onSubmit,
        reset: () => {
            form.reset()
        }
    }))

    const { fields, append, remove } = fieldArray

    const toggleMultipleAmount = () => {
        if (!multipleAmount) {
            // Switching to multiple: keep the first amount, allow adding more
            setMultipleAmount(true)
        } else {
            // Switching to single: keep only the first amount
            const currentAmounts = form.getValues('amounts')
            if (currentAmounts.length > 1) {
                for (let i = currentAmounts.length - 1; i > 0; i--) {
                    remove(i)
                }
            }
            setMultipleAmount(false)
        }
    }

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

                    <CurrencyField
                        form={form}
                        control={form.control}
                        name='currency'
                        label={t('form.currency.label')}
                        placeholder={t('form.currency.placeholder')}
                        mandatory={true}
                        variant={inputStyle}
                    />

                    <div className='flex flex-col space-y-2'>
                        <div className='flex flex-row items-center justify-between'>
                            <FormLabel mandatory>{t('form.amount.label')}</FormLabel>
                            <div className='flex flex-row'>
                                <Button type='button' size='sm' variant='ghost' onClick={() => toggleMultipleAmount()}>
                                    {!multipleAmount ? <Split /> : <Merge />}
                                </Button>
                                <div className='hr vertical'></div>
                                {multipleAmount && (
                                    <Button
                                        type='button'
                                        size='sm'
                                        variant='ghost'
                                        onClick={() =>
                                            append({ amount: 0, action: 'EXPENSES', financialAccountId: '' })
                                        }
                                    >
                                        <Plus />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {!multipleAmount ? (
                            <AmountField
                                control={form.control}
                                name='amounts.0.amount'
                                placeholder={t('form.amount.placeholder')}
                                mandatory={true}
                            />
                        ) : (
                            fields.map((field: unknown, index: number) => (
                                <div
                                    className='flex flex-row items-start justify-between space-x-2 mt-2'
                                    key={`field-${index}`}
                                >
                                    <Image src='/icon/arrow-link.svg' alt='logo' width={50} height={50} />
                                    <AmountField
                                        control={form.control}
                                        name={`amounts.${index}.amount`}
                                        placeholder={t('form.amount.placeholder')}
                                        mandatory={true}
                                    />

                                    <AccountField
                                        control={form.control}
                                        name={`amounts.${index}.financialAccountId`}
                                        placeholder={t('form.account.placeholder')}
                                        mandatory={true}
                                    />

                                    <Button
                                        type='button'
                                        size='sm'
                                        variant='ghost'
                                        className='mt-1'
                                        disabled={index == 0}
                                        onClick={() => {
                                            remove(index)
                                        }}
                                    >
                                        <Trash2 className='danger cursor-pointer' />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>

                    {multipleAmount && (
                        <AccountField
                            control={form.control}
                            name='amounts.0.financialAccountId'
                            placeholder={t('form.account.placeholder')}
                            mandatory={true}
                        />
                    )}

                    {multipleAmount && (
                        <div className='mt-2 text-sm text-muted-foreground'>
                            {t('form.amount.label')}: {calculateTotal()}
                        </div>
                    )}

                    <CategorySubcategoryField
                        form={form}
                        control={form.control}
                        name='categoryId'
                        subcategoryName='subcategoryId'
                        mandatory={true}
                        variant={inputStyle}
                    />

                    <NoteField
                        control={form.control}
                        name='note'
                        label={t('form.description.label')}
                        placeholder={t('form.description.placeholder')}
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

ExpensesForm.displayName = 'ExpensesForm'
