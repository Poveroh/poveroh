import { FormItem, FormLabel, FormControl } from '@poveroh/ui/components/form'
import { FileInput } from '@poveroh/ui/components/file'
import { Badge } from '@poveroh/ui/components/badge'
import { X } from 'lucide-react'
import { FileUploadFieldProps } from '@/types'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export function FileUploadField({
    label,
    file,
    onFileChange,
    toUploadMessage = 'To upload:',
    accept,
    multiple = false,
    mandatory = false
}: FileUploadFieldProps) {
    const t = useTranslations()

    const [fileList, setFileList] = useState<File[]>(file || [])
    const [fileError, setFileError] = useState(false)

    const handleFileChange = (files: File[]) => {
        setFileList(files)
        setFileError(files.length === 0)
        onFileChange?.(files)
    }

    return (
        <div className='flex flex-col space-y-4'>
            <FormItem>
                <FormLabel mandatory={mandatory}>{label}</FormLabel>
                <FormControl>
                    <FileInput
                        onChange={e => handleFileChange(e.target.files ? Array.from(e.target.files) : [])}
                        accept={accept}
                        multiple={multiple}
                    />
                </FormControl>
                {fileError && <p className='danger'>{t('messages.errors.required')}</p>}
            </FormItem>

            {fileList && (
                <div className='flex flex-wrap gap-2'>
                    <p>{toUploadMessage}:</p>
                    {fileList.map((file, index) => (
                        <Badge key={index} className='flex items-center gap-1 w-fit'>
                            {file.name}
                            <button
                                onClick={() => {
                                    const newFileList = fileList.filter((_, i) => i !== index)
                                    handleFileChange(newFileList)
                                }}
                                className='ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5 transition-colors'
                                aria-label='Remove'
                                type='button'
                            >
                                <X className='h-3 w-3' />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    )
}
