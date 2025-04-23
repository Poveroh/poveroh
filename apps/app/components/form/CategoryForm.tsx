'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { ICategory, IItem } from '@poveroh/types'
import { TransactionService } from '@/services/transaction.service'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@poveroh/ui/components/tooltip'
import { Input } from '@poveroh/ui/components/input'
import { Textarea } from '@poveroh/ui/components/textarea'
import { toast } from '@poveroh/ui/components/sonner'

import { iconList } from '../icon'
import DynamicIcon from '../icon/dynamicIcon'

type FormProps = {
    initialData?: ICategory | null
    inEditingMode: boolean
    dataCallback: (formData: FormData) => Promise<void>
    closeDialog: () => void
}

export const CategoryForm = forwardRef(({ initialData, inEditingMode, dataCallback }: FormProps, ref) => {
    const t = useTranslations()

    const transactionService = new TransactionService()
    const transactionActions = transactionService.getActionList(t, true)

    const [icon, setIcon] = useState(iconList[0])
    const [iconError, setIconError] = useState(false)

    const defaultValues = {
        title: '',
        description: '',
        logo_icon: iconList[0] as string,
        for: 'EXPENSES'
    }

    const formSchema = z.object({
        title: z.string().nonempty(t('messages.errors.required')),
        description: z.string(),
        logo_icon: z.string().nonempty(t('messages.errors.required')),
        for: z.string()
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
                        name='for'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel mandatory>{t('form.type.label')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('form.type.placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {transactionActions.map((item: IItem) => (
                                            <SelectItem key={item.value} value={item.value.toString()}>
                                                {item.label}
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

CategoryForm.displayName = 'CategoryForm'
