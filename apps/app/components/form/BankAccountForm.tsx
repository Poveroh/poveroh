'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { BankAccountType, FormRef, IBankAccount, IItem } from '@poveroh/types'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { Textarea } from '@poveroh/ui/components/textarea'
import { Badge } from '@poveroh/ui/components/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { FileInput } from '@poveroh/ui/components/file'

import { X } from 'lucide-react'
import { useError } from '@/hooks/useError'
import { useBankAccount } from '@/hooks/useBankAccount'

type FormProps = {
    initialData?: IBankAccount | null
    inEditingMode: boolean
    dataCallback: (formData: FormData) => Promise<void>
    closeDialog: () => void
}

export const BankAccountForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const t = useTranslations()

    const { initialData, inEditingMode, dataCallback } = props

    const { getTypeList } = useBankAccount()
    const { handleError } = useError()

    const [file, setFile] = useState<FileList | null>(null)
    const [fileError, setFileError] = useState(false)

    const defaultValues = initialData || {
        title: '',
        description: '',
        type: BankAccountType.BANK_ACCOUNT
    }

    const formSchema = z.object({
        title: z.string().nonempty(t('messages.errors.required')),
        description: z.string(),
        type: z.enum(Object.values(BankAccountType) as [BankAccountType, ...BankAccountType[]])
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

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            console.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    const handleLocalSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formData = new FormData()

            formData.append('data', JSON.stringify(inEditingMode ? { ...initialData, ...values } : values))

            if (file && file[0]) {
                formData.append('file', file[0])
            } else if (!inEditingMode) {
                setFileError(true)
                return
            }

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

                    <FormField
                        control={form.control}
                        name='type'
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
                                        {getTypeList().map((item: IItem) => (
                                            <SelectItem key={item.value} value={item.value}>
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
                </div>
            </form>
        </Form>
    )
})

BankAccountForm.displayName = 'BankAccountForm'
