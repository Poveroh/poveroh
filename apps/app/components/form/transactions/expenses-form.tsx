'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { FormRef, TransactionFormProps } from '@/types/form'
import { IFinancialAccount } from '@poveroh/types'
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
    AccountField,
    IgnoreField,
    FileUploadField
} from '@/components/fields'
import { useFinancialAccountStore } from '@/store/account.store'
import { CategorySubcategoryField } from '@/components/fields/category-subcategory-field'
import { useExpensesForm } from '@/hooks/form/use-expenses-form'

export const ExpensesForm = forwardRef<FormRef, TransactionFormProps>((props, ref) => {
    const { dataCallback } = props

    const t = useTranslations()
    const { financialAccountCacheList } = useFinancialAccountStore()
    const { form, file, multipleAmount, fieldArray, setFile, handleSubmit, calculateTotal, toggleMultipleAmount } =
        useExpensesForm(props)

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(values => handleSubmit(values, dataCallback))()
        },
        reset: () => {
            form.reset()
        }
    }))

    const { fields, append, remove } = fieldArray || {
        fields: [] as unknown[],
        append: () => {},
        remove: () => {}
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

                    <FormField
                        control={form.control}
                        name='totalAmount'
                        render={({ field }) => (
                            <FormItem>
                                <div className='flex flex-row items-center justify-between'>
                                    <FormLabel mandatory>{t('form.amount.label')}</FormLabel>
                                    <div className='flex flex-row'>
                                        <Button
                                            type='button'
                                            size='sm'
                                            variant='ghost'
                                            onClick={() => toggleMultipleAmount()}
                                        >
                                            {!multipleAmount ? <Split></Split> : <Merge />}
                                        </Button>
                                        <div className='hr vertical'></div>
                                        {multipleAmount && (
                                            <Button
                                                type='button'
                                                size='sm'
                                                variant='ghost'
                                                onClick={() => append({ amount: 0, financialAccountId: '' })}
                                            >
                                                <Plus />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <FormControl>
                                    <Input
                                        type='number'
                                        step='0.01'
                                        min='0'
                                        variant={inputStyle}
                                        disabled={multipleAmount}
                                        {...field}
                                        value={
                                            Number.isNaN(field.value) || field.value === undefined ? '' : field.value
                                        }
                                        onChange={e => {
                                            const val = parseFloat(e.target.value)
                                            field.onChange(val)
                                            form.setValue('amounts.0.amount', multipleAmount ? calculateTotal() : val)
                                        }}
                                        placeholder={t('form.amount.placeholder')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {multipleAmount &&
                        fields.map((field: unknown, index: number) => (
                            <div className='flex flex-row items-start justify-between space-x-2' key={`field-${index}`}>
                                <Image src='/icon/arrow-link.svg' alt='logo' width={50} height={50} />
                                <FormField
                                    control={form.control}
                                    name={`amounts.${index}.amount`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    type='number'
                                                    step='0.01'
                                                    min='0'
                                                    {...field}
                                                    value={
                                                        Number.isNaN(field.value) || field.value === undefined
                                                            ? ''
                                                            : field.value
                                                    }
                                                    variant={inputStyle}
                                                    onChange={e => {
                                                        field.onChange(parseFloat(e.target.value))
                                                        form.setValue('totalAmount', calculateTotal())
                                                    }}
                                                    placeholder={t('form.amount.placeholder')}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`amounts.${index}.financialAccountId`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger variant={inputStyle}>
                                                        <SelectValue placeholder={t('form.account.placeholder')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {financialAccountCacheList.map((item: IFinancialAccount) => (
                                                        <SelectItem key={item.id} value={item.id}>
                                                            <div className='flex items-center flex-row space-x-4'>
                                                                <BrandIcon icon={item.logoIcon} size='sm' />
                                                                <span>{item.title}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type='button'
                                    size='sm'
                                    variant='ghost'
                                    className='mt-1'
                                    disabled={index == 0}
                                    onClick={() => {
                                        remove(index)
                                        form.setValue('totalAmount', calculateTotal())
                                    }}
                                >
                                    <Trash2 className='danger cursor-pointer' />
                                </Button>
                            </div>
                        ))}

                    {!multipleAmount && (
                        <AccountField
                            control={form.control}
                            name='totalFinancialAccountId'
                            label={t('form.account.label')}
                            placeholder={t('form.account.placeholder')}
                            mandatory={true}
                            variant={inputStyle}
                        />
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
