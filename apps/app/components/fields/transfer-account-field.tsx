import { FieldValues, Path } from 'react-hook-form'
import { FormLabel } from '@poveroh/ui/components/form'
import { Button } from '@poveroh/ui/components/button'
import { TransferFieldProps } from '@/types'
import DynamicIcon from '@/components/icon/dynamic-icon'
import { AccountField } from './account-field'

export function TransferAccountField<T extends FieldValues = FieldValues>({
    control,
    fromName = 'from' as Path<T>,
    toName = 'to' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false,
    accounts,
    form
}: TransferFieldProps<T>) {
    const switchAccount = () => {
        const fromAccount = form.getValues('from')
        const toAccount = form.getValues('to')

        form.setValue('from', toAccount, { shouldValidate: false })
        form.setValue('to', fromAccount, { shouldValidate: false })
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
                    accounts={accounts}
                />
                <Button
                    type='button'
                    variant='ghost'
                    className='h-[40px] w-[40px] cursor-pointer'
                    onClick={switchAccount}
                    disabled={disabled}
                >
                    <DynamicIcon name='move-right' />
                </Button>
                <AccountField
                    control={control}
                    name={toName}
                    placeholder={placeholder}
                    variant={variant}
                    disabled={disabled}
                    mandatory={mandatory}
                    accounts={accounts}
                />
            </div>
        </div>
    )
}
