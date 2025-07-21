import { FieldValues, Path } from 'react-hook-form'
import { FormLabel } from '@poveroh/ui/components/form'
import { Button } from '@poveroh/ui/components/button'
import { TransferFieldProps } from '@poveroh/types'
import DynamicIcon from '@/components/icon/DynamicIcon'
import { BankAccountField } from './BankAccountField'

export function TransferBankAccountField<T extends FieldValues = FieldValues>({
    control,
    fromName = 'from' as Path<T>,
    toName = 'to' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false,
    bankAccounts,
    onSwitch
}: TransferFieldProps<T>) {
    return (
        <div className='flex flex-col space-y-2'>
            <FormLabel mandatory={mandatory}>{label}</FormLabel>
            <div className='flex flex-row space-x-2'>
                <BankAccountField
                    control={control}
                    name={fromName}
                    placeholder={placeholder}
                    variant={variant}
                    disabled={disabled}
                    mandatory={mandatory}
                    bankAccounts={bankAccounts}
                />
                <Button
                    type='button'
                    variant='ghost'
                    className='h-[40px] w-[40px] cursor-pointer'
                    onClick={onSwitch}
                    disabled={disabled}
                >
                    <DynamicIcon name='move-right' />
                </Button>
                <BankAccountField
                    control={control}
                    name={toName}
                    placeholder={placeholder}
                    variant={variant}
                    disabled={disabled}
                    mandatory={mandatory}
                    bankAccounts={bankAccounts}
                />
            </div>
        </div>
    )
}
