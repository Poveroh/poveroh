import { FieldValues, Path } from 'react-hook-form'
import { AccountFieldProps } from '@/types'
import { SelectField } from './select-field'
import { useFieldIcon } from '../../hooks/use-field-icon'
import { IAccount } from '@poveroh/types'
import { useAccount } from '@/hooks/use-account'
import { useEffect, useState } from 'react'

export function AccountField<T extends FieldValues = FieldValues>({
    form,
    control,
    value,
    name = 'accountId' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false
}: AccountFieldProps<T>) {
    const { createIconContent } = useFieldIcon()
    const { accountCacheList } = useAccount()

    const [localAccountCacheList, setLocalAccountCacheList] = useState(accountCacheList)

    useEffect(() => {
        setLocalAccountCacheList(accountCacheList)

        if (value && accountCacheList.some(acc => acc.id === value)) {
            form?.setValue(name as any, value)
        }
    }, [accountCacheList, form, name, value])

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
            options={localAccountCacheList}
            getOptionLabel={(item: IAccount) => item.title}
            getOptionValue={(item: IAccount) => item.id}
            onOpenChange={() => {}}
            renderOptionContent={(item: IAccount) => createIconContent(item.logoIcon, item.title, { type: 'brand' })}
        />
    )
}
