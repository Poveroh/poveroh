'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { Currencies, CyclePeriod, ISubscription, RememberPeriodType } from '@poveroh/types'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { Textarea } from '@poveroh/ui/components/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'

import { useError } from '@/hooks/useError'
import { useBankAccount } from '@/hooks/useBankAccount'

type FormProps = {
    initialData?: ISubscription | null
    inEditingMode: boolean
    dataCallback: (formData: FormData) => Promise<void>
    closeDialog: () => void
}

export const SubscriptionForm = forwardRef(({ initialData, inEditingMode, dataCallback }: FormProps, ref) => {
    const t = useTranslations()

    const { bankAccountCacheList } = useBankAccount()
    const { handleError } = useError()

    const defaultValues = initialData || {
        title: '',
        description: '',
        amount: 0,
        currency: Currencies.USD,
        logo: '',
        icon: '',
        first_payment: '',
        cycle_number: '1',
        cycle_period: CyclePeriod.MONTH,
        remember_number: 0,
        remember_period: RememberPeriodType.SAME_DAY,
        expires_date: '',
        bank_account_id: ''
    }

    const formSchema = z.object({
        title: z.string().nonempty(t('messages.errors.required')),
        description: z.string().optional(),
        amount: z.number().min(0),
        currency: z.nativeEnum(Currencies),
        logo: z.string().url().optional().or(z.literal('')),
        icon: z.string().optional().or(z.literal('')),
        first_payment: z.string(),
        cycle_number: z.string(),
        cycle_period: z.nativeEnum(CyclePeriod),
        remember_number: z.number().int().min(0),
        remember_period: z.nativeEnum(RememberPeriodType),
        expires_date: z.string(),
        bank_account_id: z.string().nonempty(t('messages.errors.required'))
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(handleLocalSubmit)()
        }
    }))

    const handleLocalSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formData = new FormData()

            formData.append('data', JSON.stringify(inEditingMode ? { ...initialData, ...values } : values))

            await dataCallback(formData)
        } catch (error) {
            handleError(error, 'Form error')
        }
    }

    return (
        <Form {...form}>
            <form className='flex flex-col space-y-10'>
                <div className='flex flex-col space-y-6'>
                    <FormField
                        control={form.control}
                        name='title'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel mandatory>{t('form.title.label')}</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='description'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('form.description.label')}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={t('form.description.placeholder')} {...field} />
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
                                        <Input type='number' min='0' step='0.01' {...field} />
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
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('form.currency.placeholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(Currencies).map(cur => (
                                                <SelectItem key={cur} value={cur}>
                                                    {cur}
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
                        name='first_payment'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel mandatory>{t('form.first_payment.label')}</FormLabel>
                                <FormControl>
                                    <Input type='date' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className='flex flex-row space-x-2'>
                        <FormField
                            control={form.control}
                            name='cycle_number'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel mandatory>{t('form.cycle_number.label')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('form.cycle_number.placeholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                <SelectItem key={day} value={day.toString()}>
                                                    {day}
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
                            name='cycle_period'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel mandatory>{t('form.cycle_period.label')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('form.cycle_period.placeholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(CyclePeriod).map(period => (
                                                <SelectItem key={period} value={period}>
                                                    {t(`format.${period.toLowerCase()}`)}
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
                        name='expires_date'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('form.expires_date.label')}</FormLabel>
                                <FormControl>
                                    <Input type='date' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='remember_period'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel mandatory>{t('form.remember_period.label')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('form.remember_period.placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(CyclePeriod).map(period => (
                                            <SelectItem key={period} value={period}>
                                                {t(`format.${period.toLowerCase()}`)}
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
                        name='bank_account_id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel mandatory>{t('form.bankaccount.label')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('form.bankaccount.placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(bankAccountCacheList).map(account => (
                                            <SelectItem key={account.id} value={account.id}>
                                                {account.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </form>
        </Form>
    )
})

SubscriptionForm.displayName = 'SubscriptionForm'
