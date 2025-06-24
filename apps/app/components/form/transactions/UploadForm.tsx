'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { Currencies, IBankAccount, ITransaction, TransactionAction } from '@poveroh/types'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Badge } from '@poveroh/ui/components/badge'
import { FileInput } from '@poveroh/ui/components/file'

import { Loader2, X } from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { BrandIcon } from '@/components/icon/BrandIcon'
import { useError } from '@/hooks/useError'
import { useBankAccount } from '@/hooks/useBankAccount'
import { Button } from '@poveroh/ui/components/button'
import { useTransaction } from '@/hooks/useTransaction'

type FormProps = {
    dataCallback: (formData: FormData) => Promise<void>
    closeDialog: () => void
}

export const UploadForm = forwardRef(({ dataCallback }: FormProps, ref) => {
    const t = useTranslations()
    const { handleError } = useError()

    const { bankAccountCacheList } = useBankAccount()
    const { parseTransactionFromCSV } = useTransaction()

    const [files, setFiles] = useState<File[] | null>(null)
    const [fileError, setFileError] = useState(false)

    const [parsedTransaction, setParsedTransaction] = useState<ITransaction[]>([])

    const [loading, setLoading] = useState(false)

    const defaultValues = {
        title: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        currency: Currencies.EUR,
        bank_account_id: '',
        category_id: '',
        subcategory_id: '',
        note: '',
        ignore: false
    }

    const formSchema = z.object({
        title: z.string().nonempty(t('messages.errors.required')),
        date: z.string({
            required_error: t('messages.errors.required')
        }),
        amount: z
            .number({
                required_error: t('messages.errors.required'),
                invalid_type_error: t('messages.errors.pattern')
            })
            .positive(),
        currency: z.string().nonempty(t('messages.errors.required')),
        bank_account_id: z.string().nonempty(t('messages.errors.required')),
        category_id: z.string().nonempty(t('messages.errors.required')),
        subcategory_id: z.string().nonempty(t('messages.errors.required')),
        note: z.string(),
        ignore: z.boolean()
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

    const parseFile = async () => {
        setLoading(true)

        const formData = new FormData()

        files?.forEach(file => {
            formData.append('files', file)
        })

        const readedParsedTransaction = await parseTransactionFromCSV(formData)

        setParsedTransaction(readedParsedTransaction)

        setLoading(false)
    }

    const handleLocalSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log('values', values)

        try {
            const formData = new FormData()

            formData.append('action', TransactionAction.INCOME)

            // if (file && file[0]) {
            //     formData.append('file', file[0])
            // }

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
                                        {bankAccountCacheList.map((item: IBankAccount) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                <div className='flex items-center flex-row space-x-4'>
                                                    <BrandIcon icon={item.logo_icon} size='sm' />
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
                            <FormLabel>{t('form.file.label')}</FormLabel>
                            <FormControl>
                                {
                                    <FileInput
                                        multiple
                                        onChange={e => {
                                            const selectedFiles = e.target.files ? Array.from(e.target.files) : []
                                            setFiles(selectedFiles)
                                            if (selectedFiles.length > 0) {
                                                setFileError(false)
                                            }
                                        }}
                                    />
                                }
                            </FormControl>
                            {fileError && <p className='danger'>{t('messages.errors.required')}</p>}
                        </FormItem>

                        {files && files.length > 0 && (
                            <div className='flex flex-col items-center space-x-2'>
                                <div className='flex flex-row justify-between items-center w-full'>
                                    <p>{t('messages.toUpload')}:</p>
                                    <Button type='button' disabled={loading} size='sm' onClick={parseFile}>
                                        {loading && <Loader2 className='animate-spin mr-2' />}
                                        {t('buttons.upload')}
                                    </Button>
                                </div>
                                <div className='flex flex-row space-x-2 w-full'>
                                    {files.map((file, index) => (
                                        <Badge key={index} className='flex items-center gap-1 w-fit'>
                                            {file.name}
                                            <button
                                                onClick={() => {
                                                    const newFiles = files.filter((_, i) => i !== index)
                                                    setFiles(newFiles)
                                                }}
                                                className='ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5 transition-colors'
                                                aria-label='Remove'
                                            >
                                                <X className='h-3 w-3' />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </Form>
    )
})

UploadForm.displayName = 'UploadForm'
