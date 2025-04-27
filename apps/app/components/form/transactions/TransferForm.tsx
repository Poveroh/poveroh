import { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'

import { IBankAccount, ITransaction } from '@poveroh/types'

import { Button } from '@poveroh/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { Calendar } from '@poveroh/ui/components/calendar'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@poveroh/ui/components/popover'

import { CalendarIcon } from 'lucide-react'

import { cn } from '@poveroh/ui/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { BrandIcon } from '@/components/icon/brandIcon'
import { Textarea } from '@poveroh/ui/components/textarea'
import DynamicIcon from '@/components/icon/dynamicIcon'
import { useError } from '@/hooks/useError'
import { useBankAccount } from '@/hooks/useBankAccount'

type FormProps = {
    initialData?: ITransaction
    inEditingMode: boolean
    dataCallback: (formData: FormData) => Promise<void>
    closeDialog: () => void
}

export const TransferForm = forwardRef(({ initialData, inEditingMode, dataCallback }: FormProps, ref) => {
    const t = useTranslations()
    const { handleError } = useError()

    const { bankAccountCacheList } = useBankAccount()

    const defaultValues = initialData || {
        title: '',
        date: new Date(),
        amount: 0,
        from: '',
        to: '',
        note: '',
        ignore: false
    }

    const formSchema = z
        .object({
            title: z.string().nonempty(t('messages.errors.required')),
            date: z.date({
                required_error: t('messages.errors.required')
            }),
            amount: z
                .number({
                    required_error: t('messages.errors.required'),
                    invalid_type_error: t('messages.errors.pattern')
                })
                .positive(),
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
        defaultValues: defaultValues
    })

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(handleLocalSubmit)()
        }
    }))

    const handleLocalSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log('values', values)

        try {
            const formData = new FormData()

            formData.append('data', JSON.stringify(inEditingMode ? { ...initialData, ...values } : values))

            await dataCallback(formData)
        } catch (error) {
            handleError(error)
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
                                    <Input {...field} />
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
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant='secondary'
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, 'PPP')
                                                ) : (
                                                    <span>{t('form.date.placeholder')}</span>
                                                )}
                                                <CalendarIcon className='ml-auto h-4 w-4' />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value}
                                            onSelect={x => field.onChange(x)}
                                            disabled={date => date > new Date() || date < new Date('1900-01-01')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                        placeholder={t('form.amount.placeholder')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className='flex flex-col space-y-2'>
                        <FormLabel mandatory>{t('form.bankaccount.label')}</FormLabel>
                        <div className='flex flex-row space-x-2'>
                            <FormField
                                control={form.control}
                                name='from'
                                render={({ field }) => (
                                    <FormItem>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('form.bankaccount.placeholder')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {bankAccountCacheList.map((item: IBankAccount) => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        <div className='flex items-center flex-row space-x-4'>
                                                            <BrandIcon icon={`url(${item.logo_icon})`} size='sm' />
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
                            <DynamicIcon name='move-right' className='h-[40px] w-[40px]' />
                            <FormField
                                control={form.control}
                                name='to'
                                render={({ field }) => (
                                    <FormItem>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('form.bankaccount.placeholder')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {bankAccountCacheList.map((item: IBankAccount) => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        <div className='flex items-center flex-row space-x-4'>
                                                            <BrandIcon icon={`url(${item.logo_icon})`} size='sm' />
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
                                    <Textarea placeholder={t('form.note.placeholder')} {...field} />
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
