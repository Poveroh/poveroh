'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { ICategory, ISubcategory, TransactionAction } from '@poveroh/types'

import { toast } from '@poveroh/ui/components/sonner'
import { Button } from '@poveroh/ui/components/button'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { DialogFooter } from '@poveroh/ui/components/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { Textarea } from '@poveroh/ui/components/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue
} from '@poveroh/ui/components/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@poveroh/ui/components/tooltip'

import { Loader2 } from 'lucide-react'

import { iconList } from '../icon'
import DynamicIcon from '../icon/dynamicIcon'

type FormProps = {
    initialData?: ISubcategory
    inEditingMode: boolean
    categoryList: ICategory[]
    onSubmit: (formData: FormData) => Promise<void>
    closeDialog: () => void
}

export function SubcategoryForm({ initialData, inEditingMode, categoryList, onSubmit, closeDialog }: FormProps) {
    const t = useTranslations()

    const [icon, setIcon] = useState(iconList[0])
    const [iconError, setIconError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)

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
            form.reset({
                title: initialData.title,
                description: initialData.description || '',
                logo_icon: initialData.logo_icon,
                category_id: initialData.category_id
            })
            form.setValue('category_id', initialData.category_id)
            setIcon(initialData.logo_icon)
        }
    }, [initialData, form])

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)

        try {
            const formData = new FormData()

            formData.append('subcategory', JSON.stringify(inEditingMode ? { ...initialData, ...values } : values))

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
                                <FormLabel mandatory>{t('subcategories.form.title.label')}</FormLabel>
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
                                <FormLabel>{t('subcategories.form.description.label')}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={t('subcategories.form.description.placeholder')}
                                        {...field}
                                    />
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
                                <FormLabel mandatory>{t('subcategories.form.category.label')}</FormLabel>
                                <Select
                                    value={field.value}
                                    defaultValue={field.value}
                                    onValueChange={value => {
                                        field.onChange(value)
                                    }}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('subcategories.form.category.placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <p className='p-2'>{t('transactions.types.expenses')}</p>
                                        {categoryList
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
                                        {categoryList
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
                            <FormLabel mandatory={!inEditingMode}>{t('subcategories.form.icon.label')}</FormLabel>
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
