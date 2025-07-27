'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import {
    Currencies,
    currencyCatalog,
    IAccount,
    ICategory,
    IItem,
    ISubcategory,
    TransactionAction
} from '@poveroh/types'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { Badge } from '@poveroh/ui/components/badge'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { FileInput } from '@poveroh/ui/components/file'

import { X } from 'lucide-react'
import icons from 'currency-icons'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import DynamicIcon from '@/components/icon/dynamic-icon'
import { BrandIcon } from '@/components/icon/brand-icon'
import { Textarea } from '@poveroh/ui/components/textarea'
import { useError } from '@/hooks/use-error'
import { useCategory } from '@/hooks/use-category'
import { useAccount } from '@/hooks/use-account'
import logger from '@/lib/logger'
import { amountSchema, FormProps, FormRef } from '@/types/form'

export const IncomeForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const t = useTranslations()

    const { initialData, inEditingMode, inputStyle, dataCallback } = props

    const { handleError } = useError()
    const { categoryCacheList } = useCategory()
    const { accountCacheList } = useAccount()

    const [subcategoryList, setSubcategoryList] = useState<ISubcategory[]>([])

    const [file, setFile] = useState<FileList | null>(null)
    const [fileError, setFileError] = useState(false)

    const defaultValues = {
        title: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        currency: Currencies.EUR,
        accountId: '',
        categoryId: '',
        subcategoryId: '',
        note: '',
        ignore: false
    }

    const formSchema = z.object({
        title: z.string().nonempty(t('messages.errors.required')),
        date: z.string({
            required_error: t('messages.errors.required')
        }),
        amount: amountSchema({
            required_error: t('messages.errors.required'),
            invalid_type_error: t('messages.errors.pattern')
        }),
        currency: z.string().nonempty(t('messages.errors.required')),
        accountId: z.string().nonempty(t('messages.errors.required')),
        categoryId: z.string().nonempty(t('messages.errors.required')),
        subcategoryId: z.string().nonempty(t('messages.errors.required')),
        note: z.string(),
        ignore: z.boolean()
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: props.initialData || defaultValues
    })

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(handleLocalSubmit)()
        }
    }))

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            logger.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                amount: initialData.amounts[0]?.amount || 0
            })
        }
    }, [initialData])

    const parseSubcategoryList = async (categoryId: string) => {
        const category = categoryCacheList.find(item => item.id === categoryId)
        const res = category ? category.subcategories : []

        setSubcategoryList(res)
    }

    const handleLocalSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log('values', values)

        try {
            const formData = new FormData()

            formData.append('data', JSON.stringify(inEditingMode ? { ...initialData, ...values } : values))
            formData.append('action', TransactionAction.INCOME)

            if (file && file[0]) {
                formData.append('file', file[0])
            }

            await dataCallback(formData)
        } catch (error) {
            handleError(error, 'Form error')
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={e => {
                    e.preventDefault()
                }}
            >
                <div className='flex flex-col space-y-6'>
                    <FormField
                        control={form.control}
                        name='title'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel mandatory>{t('form.title.label')}</FormLabel>
                                <FormControl>
                                    <Input {...field} variant={inputStyle} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='date'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel mandatory>{t('form.date.label')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type='date'
                                        {...field}
                                        variant={inputStyle}
                                        value={field.value ? field.value.split('T')[0] : ''}
                                        onChange={e => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className='flex flex-row space-x-2'>
                        <FormField
                            control={form.control}
                            name='amount'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel mandatory>{t('form.amount.label')}</FormLabel>
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
                                            onChange={e => field.onChange(parseFloat(e.target.value))}
                                            placeholder={t('form.amount.placeholder')}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='currency'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel mandatory>{t('form.currency.label')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger variant={inputStyle}>
                                                <SelectValue placeholder={t('form.currency.placeholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {currencyCatalog.map((item: IItem) => (
                                                <SelectItem key={item.value} value={item.value}>
                                                    <div className='flex items-center flex-row space-x-4'>
                                                        <span>{icons[item.value]?.symbol || ''}</span>
                                                        <span>{item.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name='accountId'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel mandatory>{t('form.account.label')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger variant={inputStyle}>
                                            <SelectValue placeholder={t('form.account.placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {accountCacheList.map((item: IAccount) => (
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

                    <div className='flex flex-row space-x-2'>
                        <FormField
                            control={form.control}
                            name='categoryId'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel mandatory>{t('form.category.label')}</FormLabel>
                                    <Select
                                        onValueChange={x => {
                                            parseSubcategoryList(x)
                                            field.onChange(x)
                                        }}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger variant={inputStyle}>
                                                <SelectValue placeholder={t('form.category.placeholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categoryCacheList.map((item: ICategory) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    <div className='flex items-center flex-row space-x-4'>
                                                        <DynamicIcon
                                                            name={item.logoIcon}
                                                            className='h-4 w-4'
                                                        ></DynamicIcon>
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
                        <FormField
                            control={form.control}
                            name='subcategoryId'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel mandatory>{t('form.subcategory.label')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger variant={inputStyle}>
                                                <SelectValue placeholder={t('form.subcategory.placeholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {subcategoryList.map((item: ISubcategory) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    <div className='flex items-center flex-row space-x-4'>
                                                        <DynamicIcon
                                                            name={item.logoIcon}
                                                            className='h-4 w-4'
                                                        ></DynamicIcon>
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
                    </div>

                    <FormField
                        control={form.control}
                        name='note'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('form.note.label')}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={t('form.note.placeholder')}
                                        {...field}
                                        variant={inputStyle}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className='flex flex-col space-y-4'>
                        <FormItem>
                            <FormLabel>{t('form.file.label')}</FormLabel>
                            <FormControl>
                                {
                                    <FileInput
                                        onChange={e => {
                                            setFile(e.target.files)
                                            setFileError(false)
                                        }}
                                    />
                                }
                            </FormControl>
                            {fileError && <p className='danger'>{t('messages.errors.required')}</p>}
                        </FormItem>

                        {file && (
                            <div className='flex flex-row items-center space-x-2'>
                                <p>{t('messages.toUpload')}:</p>
                                <Badge className='flex items-center gap-1 w-fit'>
                                    {file.item(0)?.name}
                                    <button
                                        onClick={() => {
                                            setFile(null)
                                        }}
                                        className='ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5 transition-colors'
                                        aria-label='Remove'
                                    >
                                        <X className='h-3 w-3' />
                                    </button>
                                </Badge>
                            </div>
                        )}
                    </div>

                    <FormField
                        control={form.control}
                        name='ignore'
                        render={({ field }) => (
                            <FormItem className='flex flex-row items-start space-x-3'>
                                <div className='flex items-center space-x-2'>
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel>{t('form.ignore.label')}</FormLabel>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </form>
        </Form>
    )
})

IncomeForm.displayName = 'IncomeForm'
