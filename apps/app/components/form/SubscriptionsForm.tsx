'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { AppearanceMode, Currencies, CyclePeriod, FormRef, ISubscription, RememberPeriod } from '@poveroh/types'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { Textarea } from '@poveroh/ui/components/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'

import { useError } from '@/hooks/useError'
import { useBankAccount } from '@/hooks/useBankAccount'
import { iconList } from '../icon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@poveroh/ui/components/tooltip'
import DynamicIcon from '../icon/DynamicIcon'

type FormProps = {
    fromTemplate: boolean
    initialData?: ISubscription | null
    inEditingMode: boolean
    dataCallback: (formData: FormData) => Promise<void>
    closeDialog: () => void
}

export const SubscriptionForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const t = useTranslations()

    const { initialData, inEditingMode, fromTemplate, dataCallback } = props

    const { bankAccountCacheList } = useBankAccount()
    const { handleError } = useError()

    const [icon, setIcon] = useState(iconList[0])
    const [iconError] = useState(false)

    const defaultValues = initialData || {
        title: '',
        description: '',
        amount: 0,
        currency: Currencies.EUR,
        appearance_mode: AppearanceMode.ICON,
        appearance_logo_icon: iconList[0] as string,
        first_payment: new Date().toISOString().split('T')[0],
        cycle_number: '1',
        cycle_period: CyclePeriod.MONTH,
        remember_period: RememberPeriod.THREE_DAYS,
        bank_account_id: ''
    }

    const formSchema = z
        .object({
            title: z.string().nonempty(t('messages.errors.required')),
            description: z.string().optional(),
            amount: z.number().min(0),
            currency: z.nativeEnum(Currencies),
            appearance_mode: z.nativeEnum(AppearanceMode),
            appearance_logo_icon: z.string().nonempty(t('messages.errors.required')),
            first_payment: z.string(),
            cycle_number: z.string(),
            cycle_period: z.nativeEnum(CyclePeriod),
            remember_period: z.nativeEnum(RememberPeriod).optional(),
            bank_account_id: z.string().nonempty(t('messages.errors.required'))
        })
        .refine(
            data => {
                if (data.appearance_mode === AppearanceMode.LOGO) {
                    return z.string().safeParse(data.appearance_logo_icon).success
                }
                return true
            },
            {
                message: t('messages.errors.url'),
                path: ['appearance_logo_icon']
            }
        )

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

            values.first_payment = new Date(values.first_payment).toISOString()

            formData.append('data', JSON.stringify(inEditingMode ? { ...initialData, ...values } : values))

            await dataCallback(formData)
        } catch (error) {
            handleError(error, 'Form error')
        }
    }

    return (
        <Form {...form}>
            <form>
                <div className='flex flex-col space-y-6'>
                    {!fromTemplate && (
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
                    )}

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
                                            min='0'
                                            step='0.01'
                                            {...field}
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
                                    <Input
                                        type='date'
                                        {...field}
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
                            name='cycle_number'
                            render={({ field }) => (
                                <FormItem className='w-[30%]'>
                                    <FormLabel mandatory>{t('form.cycle_number.label')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
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
                                                <SelectValue />
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

                    {(!fromTemplate || initialData?.appearance_mode == AppearanceMode.ICON) && (
                        <div className='flex flex-col space-y-4'>
                            <FormItem>
                                <FormLabel mandatory={!inEditingMode}>{t('form.icon.label')}</FormLabel>
                                <FormControl>
                                    {
                                        <div className='grid grid-cols-12 gap-5 rounded-md box-border'>
                                            {iconList.map(x => {
                                                return (
                                                    <TooltipProvider key={x}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div
                                                                    key={x}
                                                                    className={`box-border p-1 cursor-pointer flex justify-center items-center rounded-md h-[30px] w-[30px]
                                                                                        ${icon === x ? 'bg-white text-black border border-hr' : ''}`}
                                                                    onClick={() => {
                                                                        form.setValue('appearance_logo_icon', x)
                                                                        setIcon(x)
                                                                    }}
                                                                >
                                                                    <DynamicIcon key={x} name={x}></DynamicIcon>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{x}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )
                                            })}
                                        </div>
                                    }
                                </FormControl>
                                {iconError && <p className='danger'>{t('messages.errors.required')}</p>}
                            </FormItem>
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name='remember_period'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('form.remember_period.label')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(RememberPeriod).map(period => (
                                            <SelectItem key={period} value={period}>
                                                {t(`reminderPeriod.${period.toLowerCase()}`)}
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
                </div>
            </form>
        </Form>
    )
})

SubscriptionForm.displayName = 'SubscriptionForm'
