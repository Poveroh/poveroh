'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'

import { FormRef, IImports, IPendingTransaction } from '@poveroh/types'

import { TransactionsApprovalList } from '@/components/other/TransactionsApprovalList'
import { BankAccountAndFileForm } from './BankAccountAndFileForm'
import { cloneDeep } from 'lodash'
import { useTransaction } from '@/hooks/useTransaction'

type FormProps = {
    dataCallback: (formData: FormData) => Promise<void>
    showSaveButton: (enable?: boolean) => void
    closeDialog: () => void
}

export const UploadForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const [parsedTransaction, setParsedTransaction] = useState<IPendingTransaction[]>([])

    const {} = useTransaction()

    useImperativeHandle(ref, () => ({
        submit: () => {}
    }))

    const handleCallback = async (importedFiles: IImports) => {
        const readedTransactions = cloneDeep(parsedTransaction)
        readedTransactions.push(...importedFiles.transactions)
        setParsedTransaction(readedTransactions)
        props.showSaveButton(true)
    }

    return (
        <div className='flex flex-col space-y-6'>
            <BankAccountAndFileForm dataCallback={handleCallback} />

            {parsedTransaction.length > 0 && <TransactionsApprovalList transactions={parsedTransaction} />}
        </div>
    )
})

UploadForm.displayName = 'UploadForm'
