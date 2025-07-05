'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'
import { useTranslations } from 'next-intl'

import { FormRef, IBankAccount, ITransaction } from '@poveroh/types'

import { Badge } from '@poveroh/ui/components/badge'
import { FileInput } from '@poveroh/ui/components/file'

import { Loader2, X } from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { BrandIcon } from '@/components/icon/BrandIcon'
import { useBankAccount } from '@/hooks/useBankAccount'
import { Button } from '@poveroh/ui/components/button'
import { useTransaction } from '@/hooks/useTransaction'
import { TransactionsApprovalList } from '@/components/other/TransactionsApprovalList'

type FormProps = {
    dataCallback: (formData: FormData) => Promise<void>
    closeDialog: () => void
}

export const UploadForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const t = useTranslations()

    const { dataCallback, closeDialog } = props

    const { bankAccountCacheList } = useBankAccount()
    const { parseTransactionFromCSV } = useTransaction()

    const [files, setFiles] = useState<File[] | null>(null)
    const [fileError, setFileError] = useState(false)

    const [bankAccount, setBankAccount] = useState('')
    const [parsedTransaction, setParsedTransaction] = useState<ITransaction[]>([])

    const [loading, setLoading] = useState(false)

    useImperativeHandle(ref, () => ({
        submit: () => {}
    }))

    const parseFile = async () => {
        setLoading(true)

        const formData = new FormData()

        if (bankAccount === '') {
            setFileError(true)
            setLoading(false)
            return
        }

        formData.append('bankAccountId', bankAccount)

        files?.forEach(file => {
            formData.append('files', file)
        })

        const readedParsedTransaction = await parseTransactionFromCSV(formData)

        setParsedTransaction(readedParsedTransaction)

        setLoading(false)
    }

    return (
        <div className='flex flex-col space-y-6'>
            <div className='flex flex-col space-y-2'>
                <p>{t('form.bankaccount.label')}</p>
                <Select onValueChange={setBankAccount} value={bankAccount} defaultValue={bankAccount}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('form.bankaccount.placeholder')} />
                    </SelectTrigger>
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
            </div>

            <div className='flex flex-col space-y-6'>
                <div className='flex flex-col space-y-2'>
                    <p>{t('form.file.label')}</p>
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
                    {fileError && <p className='danger'>{t('messages.errors.required')}</p>}
                </div>

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

                {parsedTransaction.length > 0 && <TransactionsApprovalList transactions={parsedTransaction} />}
            </div>
        </div>
    )
})

UploadForm.displayName = 'UploadForm'
