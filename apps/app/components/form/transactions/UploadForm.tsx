'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'

import { FormRef, ITransaction } from '@poveroh/types'

import { TransactionsApprovalList } from '@/components/other/TransactionsApprovalList'
import { BankAccountAndFileForm } from './BankAccountAndFileForm'
import { cloneDeep } from 'lodash'

type FormProps = {
    dataCallback: (formData: FormData) => Promise<void>
    showSaveButton: () => void
    closeDialog: () => void
}

export const UploadForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const [parsedTransaction, setParsedTransaction] = useState<ITransaction[]>([])

    useImperativeHandle(ref, () => ({
        submit: () => {}
    }))

    const handleCallback = async (transactions: ITransaction[]) => {
        const readedTransactions = cloneDeep(parsedTransaction)
        readedTransactions.push(...transactions)
        setParsedTransaction(readedTransactions)
        props.showSaveButton()
    }

    return (
        <div className='flex flex-col space-y-6'>
            <BankAccountAndFileForm dataCallback={handleCallback} />

            {parsedTransaction.length > 0 && <TransactionsApprovalList transactions={parsedTransaction} />}
        </div>
    )
})

UploadForm.displayName = 'UploadForm'
