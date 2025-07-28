'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

import {
    Currencies,
    currencyCatalog,
    IAccount,
    ICategory,
    IItem,
    ISubcategory,
    TransactionAction
} from '@poveroh/types'
import { amountSchema, FormRef, TransactionFormProps } from '@/types/form'

import { Button } from '@poveroh/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { Badge } from '@poveroh/ui/components/badge'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { FileInput } from '@poveroh/ui/components/file'

import { Merge, Plus, Split, Trash2, X } from 'lucide-react'
import icons from 'currency-icons'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import DynamicIcon from '@/components/icon/dynamic-icon'
import { BrandIcon } from '@/components/icon/brand-icon'
import { Textarea } from '@poveroh/ui/components/textarea'
import { useError } from '@/hooks/use-error'
import { useCategory } from '@/hooks/use-category'
import { useAccount } from '@/hooks/use-account'
import logger from '@/lib/logger'
import { cloneDeep } from 'lodash'

export const ExpensesForm = forwardRef<FormRef, TransactionFormProps>((props: TransactionFormProps, ref) => {
    const t = useTranslations()
    const { handleError } = useError()

    const { initialData, inEditingMode, inputStyle, dataCallback } = props

    const { categoryCacheList } = useCategory()
    const { accountCacheList } = useAccount()

    const [subcategoryList, setSubcategoryList] = useState<ISubcategory[]>([])

    const [file, setFile] = useState<FileList | null>(null)
    const [fileError, setFileError] = useState(false)

    const defaultAmounts = {
        amount: 0,
        accountId: ''
    }

    const defaultValues = {
        title: '',
        date: new Date().toISOString().split('T')[0],
        currency: Currencies.EUR,
        totalAmount: 0,
        amounts: [defaultAmounts],
        categoryId: '',
        subcategoryId: '',
        note: '',
        ignore: false,
        multipleAmount: false
    }

    const baseSchema = z.object({
        title: z.string().nonempty(t('messages.errors.required')),
        date: z.string({
            required_error: t('messages.errors.required')
        }),
        totalAmount: amountSchema({
            required_error: t('messages.errors.required'),
            invalid_type_error: t('messages.errors.pattern')
        }),
        multipleAmount: z.boolean().default(false),
        currency: z.string().nonempty(t('messages.errors.required')),
        categoryId: z.string().nonempty(t('messages.errors.required')),
        subcategoryId: z.string().nonempty(t('messages.errors.required')),
        note: z.string(),
        ignore: z.boolean()
    })

    const amountsSchema = baseSchema.extend({
        multipleAmount: z.literal(true),
        amounts: z
            .array(
                z.object({
                    amount: amountSchema({
                        required_error: t('messages.errors.required'),
                        invalid_type_error: t('messages.errors.pattern')
                    }),
                    accountId: z.string().nonempty(t('messages.errors.required'))
                })
            )
            .min(1, 'At least one entry is required')
    })

    const accountSchema = baseSchema.extend({
        multipleAmount: z.literal(false),
        totalAccountId: z.string().nonempty(t('messages.errors.required'))
    })

    const formSchema = z.discriminatedUnion('multipleAmount', [amountsSchema, accountSchema]).refine(
        data => {
            if (data.multipleAmount && 'amounts' in data) {
                const sum = data.amounts.reduce((acc, curr) => acc + curr.amount, 0)
                return sum === data.totalAmount
            }
            return true
        },
        {
            message: 'Total amount must match the sum of all amounts',
            path: ['totalAmount']
        }
    )

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: props.initialData || defaultValues
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'amounts'
    })

    const multipleAmount = form.watch('multipleAmount')
    const toggleMultipleAmount = () => {
        form.setValue('multipleAmount', !multipleAmount)
    }

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
            let dataInitialToShow: any

            // If there are multiple amounts, use the multipleAmount: true schema
            if (initialData.amounts && initialData.amounts.length > 1) {
                dataInitialToShow = {
                    ...initialData,
                    multipleAmount: true,
                    // Remove totalAccountId if present
                    totalAccountId: undefined
                }
            } else {
                // Otherwise, use the multipleAmount: false schema
                dataInitialToShow = {
                    ...initialData,
                    multipleAmount: false,
                    totalAmount: initialData.amounts?.[0]?.amount || 0,
                    totalAccountId: initialData.amounts?.[0]?.accountId || '',
                    currency: initialData.amounts?.[0]?.currency || Currencies.EUR,
                    amounts: undefined
                }
            }

            form.reset(dataInitialToShow)
        }
    }, [initialData])

    const calculateTotal = () => {
        const values = form.getValues()
        if ('amounts' in values && Array.isArray(values.amounts)) {
            return values.amounts.reduce((acc, curr) => acc + curr.amount, 0)
        }
        return 0
    }

    const parseSubcategoryList = async (categoryId: string) => {
        const category = categoryCacheList.find(item => item.id === categoryId)
        const res = category ? category.subcategories : []

        setSubcategoryList(res)
    }

    const handleLocalSubmit = async (values: z.infer<typeof formSchema>) => {
        logger.debug('values', values)

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let localTransaction: any = { ...props.initialData, ...cloneDeep(values) }

            console.log('localTransaction', localTransaction)

            const formData = new FormData()

            if (!multipleAmount) {
                const { totalAmount, totalAccountId, ...rest } = localTransaction
                localTransaction = {
                    ...rest,
                    amounts: [
                        {
                            amount: totalAmount,
                            accountId: totalAccountId
                        }
                    ]
                }
            }

            formData.append(
                'data',
                JSON.stringify(inEditingMode ? { ...initialData, ...localTransaction } : localTransaction)
            )
            formData.append('action', TransactionAction.EXPENSES)

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
                                        onChange={e => field.onChange(e.target.value)}
                                        value={field.value ? field.value.split('T')[0] : ''}
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
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger variant={inputStyle}>
                                            <SelectValue placeholder={t('form.currency.placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent defaultValue={field.value}>
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
                                                onClick={() => append(defaultAmounts)}
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
                        fields.map((field, index) => (
                            <div className='flex flex-row items-start justify-between space-x-2' key={field.id}>
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
                                                        field.onChange(e.target.value)
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
                                    name={`amounts.${index}.accountId`}
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
                        <FormField
                            control={form.control}
                            name='totalAccountId'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel mandatory>{t('form.account.label')}</FormLabel>
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
                    )}

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
                                        value={field.value}
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
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
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

ExpensesForm.displayName = 'ExpensesForm'
