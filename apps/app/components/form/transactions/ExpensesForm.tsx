'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

import {
    Currencies,
    currencyCatalog,
    FormProps,
    FormRef,
    IBankAccount,
    ICategory,
    IItem,
    ISubcategory,
    TransactionAction
} from '@poveroh/types'

import { Button } from '@poveroh/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { Badge } from '@poveroh/ui/components/badge'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { FileInput } from '@poveroh/ui/components/file'

import { Merge, Plus, Split, Trash2, X } from 'lucide-react'
import icons from 'currency-icons'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import DynamicIcon from '@/components/icon/DynamicIcon'
import { BrandIcon } from '@/components/icon/BrandIcon'
import { Textarea } from '@poveroh/ui/components/textarea'
import { useError } from '@/hooks/useError'
import { useCategory } from '@/hooks/useCategory'
import { useBankAccount } from '@/hooks/useBankAccount'

export const ExpensesForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const t = useTranslations()
    const { handleError } = useError()

    const { initialData, inEditingMode, inputStyle, dataCallback } = props

    const { categoryCacheList } = useCategory()
    const { bankAccountCacheList } = useBankAccount()

    const [subcategoryList, setSubcategoryList] = useState<ISubcategory[]>([])
    const [multipleAmount, setMultipleAmount] = useState(false)

    const [file, setFile] = useState<FileList | null>(null)
    const [fileError, setFileError] = useState(false)

    const defaultAmounts = {
        amount: 0,
        bank_account_id: ''
    }

    const defaultValues = {
        title: '',
        date: new Date().toISOString().split('T')[0],
        currency: Currencies.EUR,
        total_amount: 0,
        amounts: [defaultAmounts],
        category_id: '',
        subcategory_id: '',
        note: '',
        ignore: false
    }

    const formSchema = z
        .object({
            title: z.string().nonempty(t('messages.errors.required')),
            date: z.string({
                required_error: t('messages.errors.required')
            }),
            total_amount: z
                .number({
                    required_error: t('messages.errors.required'),
                    invalid_type_error: t('messages.errors.pattern')
                })
                .positive(),
            total_bank_account_id: z.string().nonempty(t('messages.errors.required')),
            amounts: z
                .array(
                    z.object({
                        amount: z
                            .number({
                                required_error: t('messages.errors.required'),
                                invalid_type_error: t('messages.errors.pattern')
                            })
                            .positive(),
                        bank_account_id: z.string().nonempty(t('messages.errors.required'))
                    })
                )
                .min(1, 'At least one entry is required'),
            currency: z.string().nonempty(t('messages.errors.required')),
            category_id: z.string().nonempty(t('messages.errors.required')),
            subcategory_id: z.string().nonempty(t('messages.errors.required')),
            note: z.string(),
            ignore: z.boolean()
        })
        .refine(
            data => {
                const sum = data.amounts.reduce((acc, curr) => acc + curr.amount, 0)
                return sum === data.total_amount
            },
            {
                message: 'Total amount must match the sum of all amounts',
                path: ['total_amount']
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

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(handleLocalSubmit)()
        }
    }))

    const calculateTotal = () => {
        return form.getValues().amounts.reduce((acc, curr) => acc + curr.amount, 0)
    }

    const parseAmountValue = (e: string) => {
        return e === '' ? 0 : parseFloat(e)
    }

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
            <form>
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

                    <FormField
                        control={form.control}
                        name='total_amount'
                        render={({ field }) => (
                            <FormItem>
                                <div className='flex flex-row items-center justify-between'>
                                    <FormLabel mandatory>{t('form.amount.label')}</FormLabel>
                                    <div className='flex flex-row'>
                                        <Button
                                            type='button'
                                            size='sm'
                                            variant='ghost'
                                            onClick={() => setMultipleAmount(x => !x)}
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
                                                    variant={inputStyle}
                                                    onChange={e => {
                                                        field.onChange(parseAmountValue(e.target.value))
                                                        form.setValue('total_amount', calculateTotal())
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
                                    name={`amounts.${index}.bank_account_id`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger variant={inputStyle}>
                                                        <SelectValue placeholder={t('form.bankaccount.placeholder')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {bankAccountCacheList.map((item: IBankAccount) => (
                                                        <SelectItem key={item.id} value={item.id}>
                                                            <div className='flex items-center flex-row space-x-4'>
                                                                <BrandIcon icon={item.logo_icon} size='sm' />
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
                                        form.setValue('total_amount', calculateTotal())
                                    }}
                                >
                                    <Trash2 className='danger cursor-pointer' />
                                </Button>
                            </div>
                        ))}

                    {!multipleAmount && (
                        <FormField
                            control={form.control}
                            name='total_bank_account_id'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel mandatory>{t('form.bankaccount.label')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger variant={inputStyle}>
                                                <SelectValue placeholder={t('form.bankaccount.placeholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {bankAccountCacheList.map((item: IBankAccount) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    <div className='flex items-center flex-row space-x-4'>
                                                        <BrandIcon icon={item.logo_icon} size='sm' />
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
                            name='category_id'
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
                                                            name={item.logo_icon}
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
                            name='subcategory_id'
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
                                                            name={item.logo_icon}
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
