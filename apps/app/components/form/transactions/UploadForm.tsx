'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'

import { IImport, ITransaction } from '@poveroh/types'

import { TransactionsApprovalList } from '@/components/other/TransactionsApprovalList'
import { BankAccountAndFileForm } from './BankAccountAndFileForm'
import { cloneDeep } from 'lodash'
import { useImport } from '@/hooks/useImports'
import { FormRef } from '@/types'

type FormProps = {
    initialData?: IImport
    dataCallback: (data: IImport) => Promise<void>
    showSaveButton: (enable?: boolean) => void
    closeDialog: () => void
}

export const UploadForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const [parsedTransaction, setParsedTransaction] = useState<ITransaction[]>(props.initialData?.transactions || [])

    const [localImports, setLocalImports] = useState<IImport | undefined>(props.initialData)

    const { appendImport } = useImport()

    useImperativeHandle(ref, () => ({
        submit: () => {
            if (!localImports) return

            const clonedImports = cloneDeep(localImports)
            clonedImports.transactions = parsedTransaction

            return props.dataCallback(clonedImports)
        }
    }))

    const handleCallback = async (importedFiles: IImport | null) => {
        if (!importedFiles || !importedFiles.transactions) return

        const readedTransactions = cloneDeep(parsedTransaction)
        readedTransactions.push(...importedFiles.transactions)
        setParsedTransaction(readedTransactions)
        appendImport([importedFiles])
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
