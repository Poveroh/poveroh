'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Currencies, FormRef, IBankAccount, ITransaction, TransactionAction } from '@poveroh/types'

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

const listForm: ITransaction[] = [
    {
        id: 'cd8cca5c-e0d4-4b7c-8db3-b2e1df6b7f37',
        user_id: '6a750a26-301c-48c7-ab72-ac6e0e409762',
        created_at: new Date('2025-06-25T18:00:20.436Z'),
        amounts: [
            {
                id: '325656da-47ab-42bf-875c-37d7ab2d4e54',
                created_at: '2025-06-25T18:00:20.436Z',
                transaction_id: 'cd8cca5c-e0d4-4b7c-8db3-b2e1df6b7f37',
                amount: 30,
                currency: Currencies.EUR,
                action: TransactionAction.EXPENSES,
                bank_account_id: 'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4'
            }
        ],
        title: 'Nameless Festival',
        type: TransactionAction.EXPENSES,
        date: '2025-06-01T13:53:55.000Z',
        ignore: false
    },
    {
        id: '24d93a67-f1a7-4303-9073-8eee3e332d95',
        user_id: '6a750a26-301c-48c7-ab72-ac6e0e409762',
        created_at: new Date('2025-06-25T18:00:20.436Z'),
        amounts: [
            {
                id: 'ef1ff2d9-a948-4b0b-ab6f-c476700ca592',
                created_at: '2025-06-25T18:00:20.436Z',
                transaction_id: '24d93a67-f1a7-4303-9073-8eee3e332d95',
                amount: 30,
                currency: Currencies.EUR,
                action: TransactionAction.EXPENSES,
                bank_account_id: 'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4'
            }
        ],
        title: 'Nameless Festival',
        type: TransactionAction.EXPENSES,
        date: '2025-05-31T18:53:10.000Z',
        ignore: false
    },
    {
        id: '14e72639-5338-4c62-8d11-af93f6d2bde7',
        user_id: '6a750a26-301c-48c7-ab72-ac6e0e409762',
        created_at: new Date('2025-06-25T18:00:20.436Z'),
        amounts: [
            {
                id: 'c5d2790a-d415-4ecc-a760-e9c11c2c076f',
                created_at: '2025-06-25T18:00:20.436Z',
                transaction_id: '14e72639-5338-4c62-8d11-af93f6d2bde7',
                amount: 1.82,
                currency: Currencies.EUR,
                action: TransactionAction.EXPENSES,
                bank_account_id: 'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4'
            }
        ],
        title: 'Amazon Web Services',
        type: TransactionAction.EXPENSES,
        date: '2025-06-02T08:04:06.000Z',
        ignore: false
    },
    {
        id: '62b25869-eba7-494a-a93f-9eb764918cd5',
        user_id: '6a750a26-301c-48c7-ab72-ac6e0e409762',
        created_at: new Date('2025-06-25T18:00:20.436Z'),
        amounts: [
            {
                id: 'a4c6e962-6405-4c79-b956-c1647c003f9d',
                created_at: '2025-06-25T18:00:20.436Z',
                transaction_id: '62b25869-eba7-494a-a93f-9eb764918cd5',
                amount: 5.2,
                currency: Currencies.EUR,
                action: TransactionAction.EXPENSES,
                bank_account_id: 'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4'
            }
        ],
        title: 'Alva S.r.l.',
        type: TransactionAction.EXPENSES,
        date: '2025-06-02T11:47:52.000Z',
        ignore: false
    },
    {
        id: 'fe85e834-dbb7-41fe-8dd3-cc3527d08f00',
        user_id: '6a750a26-301c-48c7-ab72-ac6e0e409762',
        created_at: new Date('2025-06-25T18:00:20.436Z'),
        amounts: [
            {
                id: '1a335aa6-37ef-464d-b18d-8aa704e9d094',
                created_at: '2025-06-25T18:00:20.436Z',
                transaction_id: 'fe85e834-dbb7-41fe-8dd3-cc3527d08f00',
                amount: 200,
                currency: Currencies.EUR,
                action: TransactionAction.INCOME,
                bank_account_id: 'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4'
            }
        ],
        title: 'Apple Pay Top-Up by *3995',
        type: TransactionAction.INCOME,
        date: '2025-06-03T09:44:28.000Z',
        ignore: false
    },
    {
        id: '324bebe0-d8ad-4a01-9299-67b9ca1d0cff',
        user_id: '6a750a26-301c-48c7-ab72-ac6e0e409762',
        created_at: new Date('2025-06-25T18:00:20.436Z'),
        amounts: [
            {
                id: '9d9e91d7-4146-4a72-93da-36e3b8fe8d83',
                created_at: '2025-06-25T18:00:20.436Z',
                transaction_id: '324bebe0-d8ad-4a01-9299-67b9ca1d0cff',
                amount: 7.99,
                currency: Currencies.EUR,
                action: TransactionAction.EXPENSES,
                bank_account_id: 'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4'
            }
        ],
        title: 'iliad',
        type: TransactionAction.EXPENSES,
        date: '2025-06-02T06:11:32.000Z',
        ignore: false
    },
    {
        id: 'a0416efd-84fc-440f-971e-9dcbaafe1530',
        user_id: '6a750a26-301c-48c7-ab72-ac6e0e409762',
        created_at: new Date('2025-06-25T18:00:20.436Z'),
        amounts: [
            {
                id: 'ba9072be-0014-42f6-9bb5-be2512447b88',
                created_at: '2025-06-25T18:00:20.436Z',
                transaction_id: 'a0416efd-84fc-440f-971e-9dcbaafe1530',
                amount: 11.55,
                currency: Currencies.EUR,
                action: TransactionAction.EXPENSES,
                bank_account_id: 'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4'
            }
        ],
        title: "McDonald's",
        type: TransactionAction.EXPENSES,
        date: '2025-06-05T11:05:12.000Z',
        ignore: false
    },
    {
        id: 'ee6ea45f-ac70-4374-9ecc-ad9ca9507298',
        user_id: '6a750a26-301c-48c7-ab72-ac6e0e409762',
        created_at: new Date('2025-06-25T18:00:20.436Z'),
        amounts: [
            {
                id: '966b19a1-f4b5-4c0a-b721-89c92203449d',
                created_at: '2025-06-25T18:00:20.436Z',
                transaction_id: 'ee6ea45f-ac70-4374-9ecc-ad9ca9507298',
                amount: 44.99,
                currency: Currencies.EUR,
                action: TransactionAction.EXPENSES,
                bank_account_id: 'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4'
            }
        ],
        title: 'Parkos',
        type: TransactionAction.EXPENSES,
        date: '2025-06-06T20:44:00.000Z',
        ignore: false
    },
    {
        id: '1710ca2b-c2e2-4ea9-9e03-ac3ba7ca62f8',
        user_id: '6a750a26-301c-48c7-ab72-ac6e0e409762',
        created_at: new Date('2025-06-25T18:00:20.436Z'),
        amounts: [
            {
                id: '20e0acd4-8eb8-4ad3-bda3-8860cb18eb25',
                created_at: '2025-06-25T18:00:20.436Z',
                transaction_id: '1710ca2b-c2e2-4ea9-9e03-ac3ba7ca62f8',
                amount: 49.96,
                currency: Currencies.EUR,
                action: TransactionAction.EXPENSES,
                bank_account_id: 'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4'
            }
        ],
        title: 'EasyJet',
        type: TransactionAction.EXPENSES,
        date: '2025-06-06T20:12:28.000Z',
        ignore: false
    },
    {
        id: 'a90358a9-9ebd-4bf7-865d-eb7938ff2bbd',
        user_id: '6a750a26-301c-48c7-ab72-ac6e0e409762',
        created_at: new Date('2025-06-25T18:00:20.436Z'),
        amounts: [
            {
                id: '57bb7a1c-0727-43d2-8051-0822441c450e',
                created_at: '2025-06-25T18:00:20.436Z',
                transaction_id: 'a90358a9-9ebd-4bf7-865d-eb7938ff2bbd',
                amount: 2,
                currency: Currencies.EUR,
                action: TransactionAction.EXPENSES,
                bank_account_id: 'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4'
            }
        ],
        title: 'Gruppo Torinese Trasporti',
        type: TransactionAction.EXPENSES,
        date: '2025-06-07T16:17:27.000Z',
        ignore: false
    },
    {
        id: 'ed524223-c322-4d33-88f1-2d797e71f8bd',
        user_id: '6a750a26-301c-48c7-ab72-ac6e0e409762',
        created_at: new Date('2025-06-25T18:00:20.436Z'),
        amounts: [
            {
                id: 'e62b4696-920c-4254-ba7c-4bc8f29ff2bb',
                created_at: '2025-06-25T18:00:20.436Z',
                transaction_id: 'ed524223-c322-4d33-88f1-2d797e71f8bd',
                amount: 2.99,
                currency: Currencies.EUR,
                action: TransactionAction.EXPENSES,
                bank_account_id: 'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4'
            }
        ],
        title: 'Apple',
        type: TransactionAction.EXPENSES,
        date: '2025-06-06T06:58:05.000Z',
        ignore: false
    },
    {
        id: 'e417d2c0-bfa9-4d72-8d60-1182102227c0',
        user_id: '6a750a26-301c-48c7-ab72-ac6e0e409762',
        created_at: new Date('2025-06-25T18:00:20.436Z'),
        amounts: [
            {
                id: '58d200df-7438-438d-8576-c7bdc6e89042',
                created_at: '2025-06-25T18:00:20.436Z',
                transaction_id: 'e417d2c0-bfa9-4d72-8d60-1182102227c0',
                amount: 13.99,
                currency: Currencies.EUR,
                action: TransactionAction.EXPENSES,
                bank_account_id: 'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4'
            }
        ],
        title: 'Netflix',
        type: TransactionAction.EXPENSES,
        date: '2025-06-10T02:30:04.000Z',
        ignore: false
    },
    {
        id: '055e6369-d25f-41b6-ab78-0633c6c20a71',
        user_id: '6a750a26-301c-48c7-ab72-ac6e0e409762',
        created_at: new Date('2025-06-25T18:00:20.436Z'),
        amounts: [
            {
                id: 'dc2d0a30-474e-4e88-82f1-12a760be94a6',
                created_at: '2025-06-25T18:00:20.436Z',
                transaction_id: '055e6369-d25f-41b6-ab78-0633c6c20a71',
                amount: 11.55,
                currency: Currencies.EUR,
                action: TransactionAction.EXPENSES,
                bank_account_id: 'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4'
            }
        ],
        title: "McDonald's",
        type: TransactionAction.EXPENSES,
        date: '2025-06-10T10:57:30.000Z',
        ignore: false
    },
    {
        id: 'ca46594a-482a-46d5-ae00-402315981c76',
        user_id: '6a750a26-301c-48c7-ab72-ac6e0e409762',
        created_at: new Date('2025-06-25T18:00:20.436Z'),
        amounts: [
            {
                id: '1627da6f-12f5-447f-a751-82d039d899f1',
                created_at: '2025-06-25T18:00:20.436Z',
                transaction_id: 'ca46594a-482a-46d5-ae00-402315981c76',
                amount: 19.76,
                currency: Currencies.EUR,
                action: TransactionAction.EXPENSES,
                bank_account_id: 'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4'
            }
        ],
        title: 'Squarespace',
        type: TransactionAction.EXPENSES,
        date: '2025-06-10T10:38:46.000Z',
        ignore: false
    }
]

export const UploadForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const t = useTranslations()

    const { dataCallback, closeDialog } = props

    const { bankAccountCacheList } = useBankAccount()
    const { parseTransactionFromCSV } = useTransaction()

    const [files, setFiles] = useState<File[] | null>(null)
    const [fileError, setFileError] = useState(false)

    const [bankAccount, setBankAccount] = useState('')
    const [parsedTransaction, setParsedTransaction] = useState<ITransaction[]>(listForm)

    const [loading, setLoading] = useState(false)

    useImperativeHandle(ref, () => ({
        submit: () => {}
    }))

    const parseFile = async () => {
        setLoading(true)

        const formData = new FormData()

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

                {/* {parsedTransaction.length > 0 && <TransactionsApprovalList />} */}
                <TransactionsApprovalList transactions={parsedTransaction} />
            </div>
        </div>
    )
})

UploadForm.displayName = 'UploadForm'
