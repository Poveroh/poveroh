import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { currencyCatalog, IBankAccount, IItem, TransactionAction } from '@poveroh/types'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { Checkbox } from '@poveroh/ui/components/checkbox'

import icons from 'currency-icons'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { BrandIcon } from '@/components/icon/BrandIcon'
import { Textarea } from '@poveroh/ui/components/textarea'
import DynamicIcon from '@/components/icon/DynamicIcon'
import { useError } from '@/hooks/useError'
import { useBankAccount } from '@/hooks/useBankAccount'
import { Button } from '@poveroh/ui/components/button'
import logger from '@/lib/logger'
import { amountSchema, FormProps, FormRef } from '@/types/form'

export const TransferForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const t = useTranslations()

    const { initialData, inEditingMode, inputStyle, dataCallback } = props

    const { handleError } = useError()
    const { bankAccountCacheList } = useBankAccount()

    const defaultValues = {
        title: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        currency: 'EUR',
        from: '',
        to: '',
        note: '',
        ignore: false
    }

    const formSchema = z
        .object({
            title: z.string().nonempty(t('messages.errors.required')),
            date: z.string({
                required_error: t('messages.errors.required')
            }),
            currency: z.string().nonempty(t('messages.errors.required')),
            amount: amountSchema({
                required_error: t('messages.errors.required'),
                invalid_type_error: t('messages.errors.pattern')
            }),
            from: z.string().nonempty(t('messages.errors.required')),
            to: z.string().nonempty(t('messages.errors.required')),
            note: z.string(),
            ignore: z.boolean()
        })
        .refine(data => data.from !== data.to, {
            message: t('messages.errors.bankAccountMismatch'),
            path: ['from']
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

    const switchBankAccount = () => {
        const fromBankAccount = form.getValues('from')
        const toBankAccount = form.getValues('to')

        form.setValue('from', toBankAccount, { shouldValidate: false })
        form.setValue('to', fromBankAccount, { shouldValidate: false })
    }

    const handleLocalSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log('values', values)

        try {
            const formData = new FormData()

            formData.append('data', JSON.stringify(inEditingMode ? { ...initialData, ...values } : values))
            formData.append('action', TransactionAction.INTERNAL)

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
                                            variant={inputStyle}
                                            value={
                                                Number.isNaN(field.value) || field.value === undefined
                                                    ? ''
                                                    : field.value
                                            }
                                            onChange={e => field.onChange(parseFloat(e.target.value ?? 0))}
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

                    <div className='flex flex-col space-y-2'>
                        <FormLabel mandatory>{t('form.bankaccount.label')}</FormLabel>
                        <div className='flex flex-row space-x-2'>
                            <FormField
                                control={form.control}
                                name='from'
                                render={({ field }) => (
                                    <FormItem>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger variant={inputStyle}>
                                                    <SelectValue placeholder={t('form.bankaccount.placeholder')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {bankAccountCacheList.map((item: IBankAccount) => (
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
                                variant='ghost'
                                className='h-[40px] w-[40px] cursor-pointer'
                                onClick={switchBankAccount}
                            >
                                <DynamicIcon name='move-right' />
                            </Button>
                            <FormField
                                control={form.control}
                                name='to'
                                render={({ field }) => (
                                    <FormItem>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger variant={inputStyle}>
                                                    <SelectValue placeholder={t('form.bankaccount.placeholder')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {bankAccountCacheList.map((item: IBankAccount) => (
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
                        </div>
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

TransferForm.displayName = 'TransferForm'
