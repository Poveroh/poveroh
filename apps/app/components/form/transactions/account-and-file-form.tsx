import { useTranslations } from 'next-intl'

import { IImport } from '@poveroh/types'

import { Form } from '@poveroh/ui/components/form'
import { AccountField, FileUploadField } from '@/components/fields'
import { useImportForm } from '@/hooks/form/use-import-form'
import { forwardRef, useImperativeHandle } from 'react'
import { FormProps, FormRef } from '@/types/form'

export const AccountAndFileForm = forwardRef<
    FormRef,
    FormProps<IImport> & {
        dataCallback: (data: IImport) => Promise<void>
    }
>((props: FormProps<IImport>, ref) => {
    const { initialData, inEditingMode, dataCallback } = props

    const t = useTranslations()
    const { form, handleParseForm, files, setFiles } = useImportForm(initialData, inEditingMode)

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(values => handleParseForm(values, dataCallback))()
        }
    }))

    return (
        <Form {...form}>
            <form
                className='flex flex-col space-y-10'
                onSubmit={e => {
                    e.preventDefault()
                }}
            >
                <div className='flex flex-col space-y-6'>
                    <AccountField
                        form={form}
                        control={form.control}
                        name='financialAccountId'
                        label={t('form.account.label')}
                        placeholder={t('form.account.placeholder')}
                        mandatory={true}
                    />

                    <div className='flex flex-col space-y-4'>
                        <FileUploadField
                            label={t('form.file.label')}
                            file={files ? (files as unknown as FileList) : null}
                            onFileChange={newFiles => {
                                if (newFiles) {
                                    setFiles(newFiles)
                                } else {
                                    setFiles(null)
                                }
                            }}
                            accept={
                                '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                            }
                            multiple={true}
                            mandatory={true}
                        />
                    </div>
                </div>
            </form>
        </Form>
    )
})

AccountAndFileForm.displayName = 'AccountAndFileForm'
