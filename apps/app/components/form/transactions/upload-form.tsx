'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'

import { TransactionsApprovalList } from '@/components/other/transactions-approval-list'
import { AccountAndFileForm } from './account-and-file-form'
import { FormRef } from '@/types'
import { ImportData } from '@poveroh/types/contracts'

type FormProps = {
    initialData?: ImportData
    dataCallback: (data: ImportData) => Promise<void>
    showSaveButton: (enable?: boolean) => void
}

export const UploadForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const formRef = useRef<FormRef | null>(null)

    useImperativeHandle(ref, () => ({
        submit: () => {
            formRef.current?.submit()
        },
        reset: () => {
            formRef.current?.reset()
        }
    }))

    const handleCallback: (data: Partial<ImportData>, files: File[]) => Promise<void> = async () => {}

    return (
        <div className='flex flex-col space-y-6'>
            <AccountAndFileForm
                ref={formRef}
                initialData={props.initialData ?? null}
                inEditingMode={false}
                dataCallback={handleCallback}
            />

            <TransactionsApprovalList />
        </div>
    )
})

UploadForm.displayName = 'UploadForm'
