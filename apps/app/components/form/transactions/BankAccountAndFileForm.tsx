import { useTranslations } from 'next-intl'
import { IImport } from '@poveroh/types'
import { Form, FormDescription, FormItem, FormLabel, FormControl } from '@poveroh/ui/components/form'
import { Button } from '@poveroh/ui/components/button'
import { Badge } from '@poveroh/ui/components/badge'
import { FileInput } from '@poveroh/ui/components/file'
import { Loader2, X, Upload } from 'lucide-react'

import { useBankAccountAndFileForm } from '@/hooks/form/useBankAccountAndFileForm'
import { BankAccountField } from '@/components/fields'

type BankAccountAndFileFormProps = {
    initialData?: IImport
    dataCallback: (importedFiles: IImport) => void
}

export function BankAccountAndFileForm({ initialData, dataCallback }: BankAccountAndFileFormProps) {
    const t = useTranslations()

    const {
        form,
        loading,
        showButton,
        files,
        fileError,
        handleSubmit,
        handleFileChange,
        removeFile,
        onBankAccountOpenChange
    } = useBankAccountAndFileForm({
        initialData,
        onSuccess: dataCallback
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div className='flex flex-col space-y-6'>
                    <BankAccountField
                        control={form.control}
                        name='bankAccountId'
                        label={t('form.bankaccount.label')}
                        placeholder={t('form.bankaccount.placeholder')}
                        bankAccounts={[]}
                    />

                    <div className='flex flex-col space-y-4'>
                        <FormItem>
                            <FormLabel>{t('form.file.label')}</FormLabel>
                            <FormDescription>{t('imports.modal.fileDescription')}</FormDescription>
                            <FormControl>
                                <FileInput multiple onChange={handleFileChange} />
                            </FormControl>
                            {fileError && <p className='danger'>{t('messages.errors.required')}</p>}
                        </FormItem>
                    </div>

                    {files && files.length > 0 && (
                        <div className='grid grid-cols-[1fr_auto] gap-4 items-center'>
                            <div className='flex flex-wrap gap-2 items-center'>
                                <p className='mr-2'>{t('messages.toUpload')}:</p>
                                {files.map((file, index) => (
                                    <Badge key={index} className='flex items-center gap-1 w-fit'>
                                        {file.name}
                                        <button
                                            type='button'
                                            onClick={() => removeFile(index)}
                                            className='ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5 transition-colors'
                                            aria-label='Remove'
                                        >
                                            <X className='h-3 w-3' />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            {showButton && (
                                <Button type='submit' disabled={loading} size='sm' className='self-start'>
                                    {loading && <Loader2 className='animate-spin mr-2' />}
                                    <Upload />
                                    {t('buttons.upload')}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </form>
        </Form>
    )
}
