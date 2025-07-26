import { useState } from 'react'
import { Copy } from 'lucide-react'
import { InputWithIcon } from '@poveroh/ui/components/input-icon'
import { Tooltip, TooltipContent, TooltipTrigger } from '@poveroh/ui/components/tooltip'
import { FormItem, FormLabel, FormControl, FormMessage } from '@poveroh/ui/components/form'
import { useTranslations } from 'next-intl'

type CopyableFieldProps = {
    label?: string
    value: string
}

function CopyableField({ label, value }: CopyableFieldProps) {
    const t = useTranslations()
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
                <InputWithIcon
                    value={value}
                    icon={
                        <>
                            <Tooltip open={copied}>
                                <TooltipTrigger asChild>
                                    <Copy />
                                </TooltipTrigger>
                                <TooltipContent>{t('messages.copied')}</TooltipContent>
                            </Tooltip>
                        </>
                    }
                    onClick={handleCopy}
                    disabled
                />
            </FormControl>
            <FormMessage />
        </FormItem>
    )
}

export { CopyableField }
