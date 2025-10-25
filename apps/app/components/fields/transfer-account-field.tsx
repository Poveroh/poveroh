import { FieldValues, Path } from 'react-hook-form'
import { FormLabel } from '@poveroh/ui/components/form'
import { Button } from '@poveroh/ui/components/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@poveroh/ui/components/tooltip'
import { TransferFieldProps } from '@/types'
import DynamicIcon from '@/components/icon/dynamic-icon'
import { AccountField } from './account-field'

export function TransferAccountField<T extends FieldValues = FieldValues>({
    form,
    control,
    fromName = 'from' as Path<T>,
    toName = 'to' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false
}: TransferFieldProps<T>) {
    const switchAccount = () => {
        const fromAccount = form?.getValues(fromName)
        const toAccount = form?.getValues(toName)

        form?.setValue(fromName, (toAccount || '') as T[Path<T>], { shouldValidate: false })
        form?.setValue(toName, (fromAccount || '') as T[Path<T>], { shouldValidate: false })
    }

    return (
        <div className='flex flex-col space-y-2'>
            <FormLabel mandatory={mandatory}>{label}</FormLabel>
            <div className='flex flex-row space-x-2'>
                <AccountField
                    control={control}
                    name={fromName}
                    placeholder={placeholder}
                    variant={variant}
                    disabled={disabled}
                    mandatory={mandatory}
                />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type='button'
                            variant='ghost'
                            className='h-[40px] w-[40px] cursor-pointer'
                            onClick={switchAccount}
                            disabled={disabled}
                        >
                            <DynamicIcon name='move-right' />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Swap</TooltipContent>
                </Tooltip>
                <AccountField
                    control={control}
                    name={toName}
                    placeholder={placeholder}
                    variant={variant}
                    disabled={disabled}
                    mandatory={mandatory}
                />
            </div>
        </div>
    )
}
