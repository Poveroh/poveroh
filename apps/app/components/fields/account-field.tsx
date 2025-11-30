import { FieldValues, Path } from 'react-hook-form'
import { AccountFieldProps } from '@/types'
import { SelectField } from './select-field'
import { useFieldIcon } from '../../hooks/use-field-icon'
import { IFinancialAccount } from '@poveroh/types'
import { useFinancialAccount } from '@/hooks/use-account'
import { useEffect, useState } from 'react'

export function AccountField<T extends FieldValues = FieldValues>({
    form,
    control,
    value,
    name = 'financialAccountId' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false
}: AccountFieldProps<T>) {
    const { createIconContent } = useFieldIcon()
    const { financialAccountCacheList, fetchFinancialAccount } = useFinancialAccount()

    const [localAccountCacheList, setLocalAccountCacheList] = useState(financialAccountCacheList)

    useEffect(() => {
        setLocalAccountCacheList(financialAccountCacheList)

        if (value && financialAccountCacheList.some(acc => acc.id === value)) {
            form?.setValue(name, value as T[Path<T>])
        }
    }, [financialAccountCacheList, form, name, value])

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
            getOptionLabel={(item: IFinancialAccount) => item.title}
            getOptionValue={(item: IFinancialAccount) => item.id}
            onOpenChange={() => {
                if (financialAccountCacheList.length === 0) {
                    fetchFinancialAccount(true)
                }
            }}
            renderOptionContent={(item: IFinancialAccount) =>
                createIconContent(item.logoIcon, item.title, { type: 'brand' })
            }
        />
    )
}
