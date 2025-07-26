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

    const [fileList, setFileList] = useState<FileList | null>(file || null)
    const [fileError, setFileError] = useState(false)

    const handleFileChange = (files: FileList | null) => {
        setFileList(files)
        setFileError(!files || files.length === 0)
        onFileChange?.(files)
    }

    return (
        <div className='flex flex-col space-y-4'>
            <FormItem>
                <FormLabel mandatory={mandatory}>{label}</FormLabel>
                <FormControl>
                    <FileInput onChange={e => handleFileChange(e.target.files)} accept={accept} multiple={multiple} />
                </FormControl>
                {fileError && <p className='danger'>{t('messages.errors.required')}</p>}
            </FormItem>

            {fileList && (
                <div className='flex flex-row items-center space-x-2'>
                    <p>{toUploadMessage}:</p>
                    <Badge className='flex items-center gap-1 w-fit'>
                        {fileList?.item(0)?.name}
                        <button
                            onClick={() => onFileChange(null)}
                            className='ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5 transition-colors'
                            aria-label='Remove'
                            type='button'
                        >
                            <X className='h-3 w-3' />
                        </button>
                    </Badge>
                </div>
            )}
        </div>
    )
}
