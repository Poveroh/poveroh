import { FieldValues, Path } from 'react-hook-form'
import { AccountFieldProps } from '@/types'
import { SelectField } from './select-field'
import { useFieldIcon } from '../../hooks/use-field-icon'
import { IAccount } from '@poveroh/types'
import { useAccount } from '@/hooks/use-account'

export function AccountField<T extends FieldValues = FieldValues>({
    control,
    name = 'accountId' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false,
    accounts,
    onOpenChange
}: AccountFieldProps<T>) {
    const { createIconContent } = useFieldIcon()
    const { accountCacheList } = useAccount()

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
            options={accounts || accountCacheList}
            getOptionLabel={(item: IAccount) => item.title}
            getOptionValue={(item: IAccount) => item.id}
            onOpenChange={onOpenChange}
            renderOptionContent={(item: IAccount) => createIconContent(item.logoIcon, item.title, { type: 'brand' })}
        />
    )
}
