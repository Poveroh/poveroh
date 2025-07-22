import { FieldValues, Path } from 'react-hook-form'
import { BankAccountFieldProps } from '@/types'
import { SelectField } from './SelectField'
import { useFieldIcon } from '../../hooks/useFieldIcon'
import { IBankAccount } from '@poveroh/types'

export function BankAccountField<T extends FieldValues = FieldValues>({
    control,
    name = 'bankAccountId' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false,
    bankAccounts,
    onOpenChange
}: BankAccountFieldProps<T>) {
    const { createIconContent } = useFieldIcon()

    if (!label) return null

    return (
        <SelectField
            control={control}
            name={name}
            label={label}
            placeholder={placeholder}
            variant={variant}
            disabled={disabled}
            mandatory={mandatory}
            options={bankAccounts}
            getOptionLabel={(item: IBankAccount) => item.title}
            getOptionValue={(item: IBankAccount) => item.id}
            onOpenChange={onOpenChange}
            renderOptionContent={(item: IBankAccount) =>
                createIconContent(item.logoIcon, item.title, { type: 'brand' })
            }
        />
    )
}
