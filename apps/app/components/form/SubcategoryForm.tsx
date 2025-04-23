'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { ICategory, ISubcategory, TransactionAction } from '@poveroh/types'
import { TransactionService } from '@/services/transaction.service'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue
} from '@poveroh/ui/components/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@poveroh/ui/components/tooltip'
import { Input } from '@poveroh/ui/components/input'
import { Textarea } from '@poveroh/ui/components/textarea'
import { toast } from '@poveroh/ui/components/sonner'

import { iconList } from '../icon'
import DynamicIcon from '../icon/dynamicIcon'
import { useCache } from '@/hooks/useCache'

type FormProps = {
    initialData?: ISubcategory | null
    inEditingMode: boolean
    dataCallback: (formData: FormData) => Promise<void>
    closeDialog: () => void
}

export const SubcategoryForm = forwardRef(({ initialData, inEditingMode, dataCallback }: FormProps, ref) => {
    const t = useTranslations()

    const { categoryCacheList } = useCache()

    const transactionService = new TransactionService()
    const transactionActions = transactionService.getActionList(t, true)

    const [icon, setIcon] = useState(iconList[0])
    const [iconError, setIconError] = useState(false)

    const defaultValues = {
        title: '',
        description: '',
        logo_icon: iconList[0] as string,
        category_id: initialData?.category_id || ''
    }

    const formSchema = z.object({
        title: z.string().nonempty(t('messages.errors.required')),
        description: z.string(),
        logo_icon: z.string().nonempty(t('messages.errors.required')),
        category_id: z.string()
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    useEffect(() => {
        if (initialData) {
            form.reset(initialData)
            setIcon(initialData.logo_icon)
        }
    }, [initialData, form])

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(handleLocalSubmit)()
        }
    }))

    const handleLocalSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formData = new FormData()

            formData.append('data', JSON.stringify(inEditingMode ? { ...initialData, ...values } : values))

            if (icon && icon[0]) {
                formData.append('file', icon[0])
            } else if (!inEditingMode) {
                setIconError(true)
                return
            }

            await dataCallback(formData)
        } catch (error) {
            console.log(error)
            toast.error(t('messages.error'))
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

                    <FormField
                        control={form.control}
                        name='category_id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel mandatory>{t('form.category.label')}</FormLabel>
                                <Select
                                    value={field.value}
                                    defaultValue={field.value}
                                    onValueChange={value => {
                                        field.onChange(value)
                                    }}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('form.category.placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <p className='p-2'>{t('transactions.types.expenses')}</p>
                                        {categoryCacheList
                                            .filter(x => x.for == TransactionAction.EXPENSES)
                                            .map((item: ICategory) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    <div className='flex items-center space-x-3'>
                                                        <DynamicIcon
                                                            className='h-4 w-4'
                                                            name={item.logo_icon}
                                                        ></DynamicIcon>
                                                        <span>{item.title}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        <SelectSeparator />
                                        <p className='p-2'>{t('transactions.types.income')}</p>
                                        {categoryCacheList
                                            .filter(x => x.for == TransactionAction.INCOME)
                                            .map((item: ICategory) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    <div className='flex items-center space-x-3'>
                                                        <DynamicIcon
                                                            className='h-4 w-4'
                                                            name={item.logo_icon}
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
                                                                    form.setValue('logo_icon', x)
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
                </div>
            </form>
        </Form>
    )
})

SubcategoryForm.displayName = 'SubcategoryForm'
