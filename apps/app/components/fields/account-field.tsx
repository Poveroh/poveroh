import { FieldValues, Path } from 'react-hook-form'
import { AccountFieldProps } from '@/types'
import { SelectField } from './select-field'
import { useFieldIcon } from '../../hooks/use-field-icon'
import { useFinancialAccount } from '@/hooks/use-account'
import { useEffect, useState } from 'react'
import { FinancialAccountData } from '@poveroh/types'

export function AccountField<T extends FieldValues = FieldValues>({
    form,
    control,
    value,
    name = 'financialAccountId' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false,
    excludeIds = []
}: AccountFieldProps<T>) {
    const { createIconContent } = useFieldIcon()
    const { financialAccountCacheList, fetchFinancialAccounts } = useFinancialAccount()

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
            getOptionLabel={(item: FinancialAccountData) => item.title}
            getOptionValue={(item: FinancialAccountData) => item.id}
            getOptionDisabled={(item: FinancialAccountData) => excludeIds.includes(item.id)}
            onOpenChange={() => {
                if (financialAccountCacheList.length === 0) {
                    fetchFinancialAccounts()
                }
            }}
            renderOptionContent={(item: FinancialAccountData) =>
                createIconContent(item.logoIcon, item.title, { type: 'brand' })
            }
        />
    )
}
