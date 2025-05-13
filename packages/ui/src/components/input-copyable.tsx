import { useState } from 'react'
import { Copy } from 'lucide-react'
import { InputWithIcon } from '@poveroh/ui/components/input-icon'
import { Tooltip, TooltipContent, TooltipTrigger } from '@poveroh/ui/components/tooltip'

type CopyableInputProps = {
    value: string
}

function CopyableInput({ value }: CopyableInputProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <InputWithIcon
            value={value}
            icon={
                <>
                    <Tooltip open={copied}>
                        <TooltipTrigger asChild>
                            <Copy />
                        </TooltipTrigger>
                        <TooltipContent>Copied!</TooltipContent>
                    </Tooltip>
                </>
            }
            onClick={handleCopy}
            disabled
        />
    )
}

export { CopyableInput }
