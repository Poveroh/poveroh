import * as React from 'react'
import { CloudUpload } from 'lucide-react'

type FileInputProps = {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    multiple?: boolean
    accept?: string
}

function FileInput({ onChange, multiple, accept }: FileInputProps) {
    return (
        <div className='flex items-center justify-center w-full'>
            <label className='flex flex-col items-center justify-center w-full h-[70px] border border-dashed rounded-lg cursor-pointer'>
                <CloudUpload></CloudUpload>
                <input
                    id='file'
                    type='file'
                    multiple={multiple}
                    accept={accept}
                    className='hidden'
                    onChange={onChange}
                />
            </label>
        </div>
    )
}

export { FileInput }
