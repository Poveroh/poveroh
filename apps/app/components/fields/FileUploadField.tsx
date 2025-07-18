import { FormItem, FormLabel, FormControl } from '@poveroh/ui/components/form'
import { FileInput } from '@poveroh/ui/components/file'
import { Badge } from '@poveroh/ui/components/badge'
import { X } from 'lucide-react'
import { FileUploadFieldProps } from '@poveroh/types'

export function FileUploadField({
    label,
    file,
    onFileChange,
    fileError = false,
    errorMessage,
    toUploadMessage = 'To upload:',
    accept,
    multiple = false,
    mandatory = false
}: FileUploadFieldProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFileChange(e.target.files)
    }

    const removeFile = () => {
        onFileChange(null)
    }

    return (
        <div className='flex flex-col space-y-4'>
            <FormItem>
                <FormLabel mandatory={mandatory}>{label}</FormLabel>
                <FormControl>
                    <FileInput onChange={handleFileChange} accept={accept} multiple={multiple} />
                </FormControl>
                {fileError && errorMessage && <p className='danger'>{errorMessage}</p>}
            </FormItem>

            {file && (
                <div className='flex flex-row items-center space-x-2'>
                    <p>{toUploadMessage}:</p>
                    <Badge className='flex items-center gap-1 w-fit'>
                        {file.item(0)?.name}
                        <button
                            onClick={removeFile}
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
