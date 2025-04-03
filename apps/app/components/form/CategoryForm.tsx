'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { ICategory, IItem } from '@poveroh/types'
import { TransactionService } from '@/services/transaction.service'

import { Button } from '@poveroh/ui/components/button'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { DialogFooter } from '@poveroh/ui/components/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@poveroh/ui/components/tooltip'
import { Input } from '@poveroh/ui/components/input'
import { Textarea } from '@poveroh/ui/components/textarea'
import { toast } from '@poveroh/ui/components/sonner'

import { Loader2 } from 'lucide-react'

import { iconList } from '../icon'
import DynamicIcon from '../icon/dynamicIcon'

type FormProps = {
    initialData?: ICategory
    inEditingMode: boolean
    onSubmit: (formData: FormData) => Promise<void>
    closeDialog: () => void
}

export function CategoryForm({ initialData, inEditingMode, onSubmit, closeDialog }: FormProps) {
    const t = useTranslations()

    const transactionService = new TransactionService()
    const transactionActions = transactionService.getActionList(t, true)

    const [icon, setIcon] = useState(iconList[0])
    const [iconError, setIconError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)

    const defaultValues = {
        title: '',
        description: '',
        logo_icon: iconList[0] as string,
        for: initialData?.for || 'EXPENSES'
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

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)

        try {
            const formData = new FormData()

            formData.append('category', JSON.stringify(inEditingMode ? { ...initialData, ...values } : values))

            await onSubmit(formData)

            if (!inEditingMode) {
                if (keepAdding) {
                    form.reset(defaultValues)
                } else {
                    closeDialog()
                }
            }

            setIcon(iconList[0])
            setIconError(false)

            toast.success(
                t('messages.successfully', {
                    a: values.title,
                    b: t(inEditingMode ? 'messages.saved' : 'messages.uploaded')
                })
            )
        } catch (error) {
            toast.error(t('messages.error'))
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleKeepAddingChange = () => {
        setKeepAdding(!keepAdding)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col space-y-10'>
                <div className='flex flex-col space-y-6'>
                    <FormField
                        control={form.control}
                        name='title'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel mandatory>{t('categories.form.title.label')}</FormLabel>
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
                                <FormLabel>{t('categories.form.description.label')}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={t('categories.form.description.placeholder')} {...field} />
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
                                <FormLabel mandatory>{t('categories.form.type.label')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('categories.form.type.placeholder')} />
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
                            <FormLabel mandatory={!inEditingMode}>{t('categories.form.icon.label')}</FormLabel>
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

                <DialogFooter>
                    <div className={'flex ' + (inEditingMode ? 'justify-end' : 'justify-between') + ' w-full'}>
                        {!inEditingMode && (
                            <div className='items-top flex space-x-2'>
                                <Checkbox id='keepAdding' checked={keepAdding} onChange={handleKeepAddingChange} />
                                <div className='grid gap-1.5 leading-none cursor-pointer'>
                                    <label
                                        htmlFor='keepAdding'
                                        className='text-sm font-medium leading-none'
                                        onClick={handleKeepAddingChange}
                                    >
                                        {t('modal.continueInsert.label')}
                                    </label>
                                    <p className='text-sm text-muted-foreground'>
                                        {t('modal.continueInsert.subtitle')}
                                    </p>
                                </div>
                            </div>
                        )}
                        <Button type='submit' disabled={loading}>
                            {loading && <Loader2 className='animate-spin mr-2' />} {t('buttons.save')}
                        </Button>
                    </div>
                </DialogFooter>
            </form>
        </Form>
    )
}
