import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'

import { IBankAccount, IImports } from '@poveroh/types'

import { Badge } from '@poveroh/ui/components/badge'
import { FileInput } from '@poveroh/ui/components/file'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@poveroh/ui/components/form'

import { Loader2, X, Upload } from 'lucide-react'

import { BrandIcon } from '@/components/icon/BrandIcon'
import { useBankAccount } from '@/hooks/useBankAccount'
import { useEffect, useState } from 'react'
import { Button } from '@poveroh/ui/components/button'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useError } from '@/hooks/useError'
import logger from '@/lib/logger'
import { useImports } from '@/hooks/useImports'

type BankAccountAndFileFormProps = {
    initialData?: IImports
    dataCallback: (importedFiles: IImports) => void
}

export function BankAccountAndFileForm({ initialData, dataCallback }: BankAccountAndFileFormProps) {
    const t = useTranslations()

    const { handleError } = useError()
    const { parseTransactionFromFile } = useImports()
    const { bankAccountCacheList, fetchBankAccount } = useBankAccount()

    const [loading, setLoading] = useState(false)
    const [showButton, setShowButton] = useState(false)

    const [files, setFiles] = useState<File[] | null>(null)
    const [fileError, setFileError] = useState(false)

    const formSchema = z.object({
        bank_account_id: z.string().nonempty(t('messages.errors.required'))
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bank_account_id: initialData?.bank_account_id || ''
        }
    })

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            logger.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    const handleLocalSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true)

            const formData = new FormData()

            formData.append('bank_account_id', values.bank_account_id)

            files?.forEach(file => {
                formData.append('files', file)
            })

            const readedParsedTransaction = await parseTransactionFromFile(formData)
            setLoading(true)
            setShowButton(false)

            dataCallback(readedParsedTransaction)
        } catch (error) {
            setLoading(false)
            handleError(error, 'Form error')
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLocalSubmit)}>
                <div className='flex flex-col space-y-6'>
                    <FormField
                        control={form.control}
                        name='bank_account_id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('form.bankaccount.label')}</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    onOpenChange={async open => {
                                        if (open) {
                                            await fetchBankAccount()
                                            form.setValue(
                                                'bank_account_id',
                                                initialData?.bank_account_id || field.value || ''
                                            )
                                        }
                                    }}
                                >
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
                            <FormDescription>{t('imports.modal.fileDescription')}</FormDescription>
                            <FormControl>
                                {
                                    <FileInput
                                        multiple
                                        onChange={e => {
                                            const selectedFiles = Array.from(e.target.files || [])
                                            const existingFiles = files || []

                                            const newFiles = selectedFiles.filter(
                                                file =>
                                                    !existingFiles.some(
                                                        f =>
                                                            f.name === file.name &&
                                                            f.size === file.size &&
                                                            f.lastModified === file.lastModified
                                                    )
                                            )

                                            if (newFiles.length > 0) {
                                                setFiles([...existingFiles, ...newFiles])
                                                setShowButton(true)
                                            }

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
                            <div className='grid grid-cols-[1fr_auto] gap-4 items-center'>
                                <div className='flex flex-wrap gap-2 items-center'>
                                    <p className='mr-2'>{t('messages.toUpload')}:</p>
                                    {files.map((file, index) => (
                                        <Badge key={index} className='flex items-center gap-1 w-fit'>
                                            {file.name}
                                            <button
                                                type='button'
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
                                {showButton ? (
                                    <Button type='submit' disabled={loading} size='sm' className='self-start'>
                                        {loading && <Loader2 className='animate-spin mr-2' />}
                                        <Upload />
                                        {t('buttons.upload')}
                                    </Button>
                                ) : (
                                    <div></div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </Form>
    )
}
