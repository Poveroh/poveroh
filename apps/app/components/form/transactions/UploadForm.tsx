'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'

import { FormRef, IImports, ITransaction } from '@poveroh/types'

import { TransactionsApprovalList } from '@/components/other/TransactionsApprovalList'
import { BankAccountAndFileForm } from './BankAccountAndFileForm'
import { cloneDeep } from 'lodash'
import { useImports } from '@/hooks/useImports'

type FormProps = {
    initialData?: IImports
    dataCallback: (data: IImports) => Promise<void>
    showSaveButton: (enable?: boolean) => void
    closeDialog: () => void
}

export const UploadForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const [parsedTransaction, setParsedTransaction] = useState<ITransaction[]>(props.initialData?.transactions || [])

    const [localImports, setLocalImports] = useState<IImports | undefined>(props.initialData)

    const { appendImports } = useImports()

    useImperativeHandle(ref, () => ({
        submit: () => {
            if (!localImports) return

            const clonedImports = cloneDeep(localImports)
            clonedImports.transactions = parsedTransaction

            return props.dataCallback(clonedImports)
        }
    }))

    const handleCallback = async (importedFiles: IImports) => {
        const readedTransactions = cloneDeep(parsedTransaction)
        readedTransactions.push(...importedFiles.transactions)
        setParsedTransaction(readedTransactions)
        appendImports([importedFiles])
        setLocalImports(importedFiles)
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
