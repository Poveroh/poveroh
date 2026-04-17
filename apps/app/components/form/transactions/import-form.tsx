import { useTranslations } from 'next-intl'

import { Form } from '@poveroh/ui/components/form'
import { AccountField, FileUploadField } from '@/components/fields'
import { useImportForm } from '@/hooks/form/use-import-form'
import { forwardRef, useImperativeHandle } from 'react'
import { FormRef, ImportFormProps } from '@/types/form'

export const ImportForm = forwardRef<FormRef, ImportFormProps>((props, ref) => {
    const t = useTranslations()
    const { form, files, onSubmit, setFiles } = useImportForm(props)

    useImperativeHandle(ref, () => ({
        submit: onSubmit,
        reset: () => {
            form.reset()
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

                    <FileUploadField
                        label={t('form.file.label')}
                        file={files}
                        onFileChange={setFiles}
                        accept={
                            '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                        }
                        multiple={true}
                        mandatory={true}
                    />
                </div>
            </form>
        </Form>
    )
})

ImportForm.displayName = 'ImportForm'
