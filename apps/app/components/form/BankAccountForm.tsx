'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@poveroh/ui/components/button'
import { DialogFooter } from '@poveroh/ui/components/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { useTranslations } from 'next-intl'
import { Input } from '@poveroh/ui/components/input'
import { Textarea } from '@poveroh/ui/components/textarea'
import { Badge } from '@poveroh/ui/components/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { FileInput } from '@poveroh/ui/components/file'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { BankAccountService } from '@/services/bankaccount.service'
import { BankAccountType, IBankAccount, IItem } from '@poveroh/types'
import { Loader2, X } from 'lucide-react'
import { toast } from '@poveroh/ui/components/sonner'

type BankAccountFormProps = {
    initialData?: IBankAccount
    inEditingMode: boolean
    onSubmit: (formData: FormData) => Promise<void>
    closeDialog: () => void
}

export function BankAccountForm({ initialData, inEditingMode, onSubmit, closeDialog }: BankAccountFormProps) {
    const t = useTranslations()

    const bankAccountService = new BankAccountService()
    const bankAccountTypes = bankAccountService.getTypeList(t)

    const [file, setFile] = useState<FileList | null>(null)
    const [fileError, setFileError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)

    const defaultValues = {
        title: '',
        description: '',
        type: BankAccountType.BANK_ACCOUNT
    }

    const formSchema = z.object({
        title: z.string().nonempty(t('messages.errors.required')),
        description: z.string(),
        type: z.enum(Object.values(BankAccountType) as [BankAccountType, ...BankAccountType[]])
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    useEffect(() => {
        if (initialData) {
            form.reset(initialData)
        }
    }, [initialData, form])

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)

        try {
            const formData = new FormData()

            formData.append('account', JSON.stringify(inEditingMode ? { ...initialData, ...values } : values))

            if (file && file[0]) {
                formData.append('file', file[0])
            } else if (!inEditingMode) {
                setFileError(true)
                return
            }

            await onSubmit(formData)

            if (!inEditingMode) {
                if (keepAdding) {
                    form.reset(defaultValues)
                } else {
                    closeDialog()
                }
            }

            setFile(null)
            setFileError(false)

            toast.success(
                t('messages.successfully', {
                    a: values.title,
                    b: t(inEditingMode ? 'messages.saved' : 'messages.uploaded')
                })
            )
        } catch (error) {
            console.log(error)
            toast.error(t('messages.error'))
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
                                <FormLabel mandatory>{t('bankAccounts.form.title.label')}</FormLabel>
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
                                <FormLabel>{t('bankAccounts.form.description.label')}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={t('bankAccounts.form.description.placeholder')} {...field} />
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
                                <FormLabel mandatory>{t('bankAccounts.form.type.label')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('bankAccounts.form.type.placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {bankAccountTypes.map((item: IItem) => (
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
                            <FormLabel mandatory={!inEditingMode}>{t('bankAccounts.form.icon.label')}</FormLabel>
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
