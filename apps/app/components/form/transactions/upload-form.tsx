'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'

import { TransactionsApprovalList } from '@/components/other/transactions-approval-list'
import { AccountAndFileForm } from './account-and-file-form'
import { IImport } from '@poveroh/types'
import { FormRef } from '@/types'
import { useImport } from '@/hooks/use-imports'

type FormProps = {
    initialData?: IImport
    dataCallback: (data: IImport) => Promise<void>
    showSaveButton: (enable?: boolean) => void
    closeDialog: () => void
}

export const UploadForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const formRef = useRef<HTMLFormElement | null>(null)

    useImperativeHandle(ref, () => ({
        submit: () => {
            formRef.current?.submit()
        }
    }))

    const handleCallback = async (importedFiles: FormData | IImport) => {}

    return (
        <div className='flex flex-col space-y-6'>
            <AccountAndFileForm ref={formRef} dataCallback={handleCallback} inEditingMode={!!props.initialData} />

            <TransactionsApprovalList />
        </div>
    )
})

UploadForm.displayName = 'UploadForm'
